// history_kepsek.js — Riwayat surat untuk Kepala Sekolah
(function () {
    const user = getUser();
    if (!user) { window.location.href = "login.html"; return; }

    const aktif = getActiveJabatan().toLowerCase();
    if (aktif !== "kepala sekolah") { window.location.href = "login.html"; return; }

    const tbody = document.getElementById("tableBody");
    let allData = [];
    let activeTab = "semua";
    let activeStatus = "semua";
    let searchQuery = "";

    function formatTanggal(isoString) {
        if (!isoString || isoString.startsWith("0001")) return "-";
        return new Date(isoString).toLocaleDateString("id-ID", {
            day: "numeric", month: "short", year: "numeric"
        });
    }

    function formatWaktu(isoString) {
        if (!isoString || isoString.startsWith("0001")) return "-";
        return new Date(isoString).toLocaleTimeString("id-ID", {
            hour: "2-digit", minute: "2-digit"
        });
    }

    function renderTable() {
        let filtered = allData.filter(row => {
            if (activeTab !== "semua" && row.jenis !== activeTab) return false;
            if (activeStatus !== "semua" && row.status !== activeStatus) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!row.no_surat?.toLowerCase().includes(q) &&
                    !row.perihal?.toLowerCase().includes(q) &&
                    !row.asal?.toLowerCase().includes(q)) return false;
            }
            return true;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:1rem">Tidak ada data.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map((row, i) => `
            <tr data-status="${row.status}" data-jenis="${row.jenis}">
                <td>${i + 1}</td>
                <td>${row.jenis === "masuk" ? "Surat Masuk" : "Surat Keluar"}</td>
                <td>${formatTanggal(row.tanggal)}</td>
                <td>${formatWaktu(row.tanggal)}</td>
                <td>${row.no_surat || "-"}</td>
                <td>${row.asal || "-"}</td>
                <td>${row.perihal || "-"}</td>
                <td><span class="status ${row.status === 'disetujui' ? 'ok' : row.status === 'ditolak' ? 'no' : 'wait'}">
                    ${row.statusLabel}
                </span></td>
                <td><button class="btn-view" data-jenis="${row.jenis}" data-id="${row.id}">Lihat</button></td>
            </tr>
        `).join("");

        // Event listener tombol Lihat
        tbody.querySelectorAll(".btn-view").forEach(btn => {
            btn.addEventListener("click", () => {
                const jenis = btn.dataset.jenis;
                const id = btn.dataset.id;
                localStorage.setItem("selectedSuratId", id);
                localStorage.setItem("selectedSuratType", jenis);
                localStorage.setItem("fromHistory", "true");
                if (jenis === "masuk") {
                    window.location.href = "detail_kepsek.html";
                } else {
                    window.location.href = "detail_kepsek_keluar.html"; // atau halaman detail keluar
                }
            });
        });
    }

    // Tab
    document.querySelectorAll(".tab").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeTab = btn.dataset.jenis;
            renderTable();
        });
    });

    // Filter status
    document.getElementById("filterStatus")?.addEventListener("change", e => {
        activeStatus = e.target.value;
        renderTable();
    });

    // Search
    document.querySelector(".search")?.addEventListener("input", e => {
        searchQuery = e.target.value.trim();
        renderTable();
    });

    async function loadHistory() {
        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:1rem">Memuat...</td></tr>`;
        try {
            const [resDisposisi, resKeluar] = await Promise.all([
                apiListDisposisi(),
                apiListSuratKeluar()
            ]);

            const dataDisposisi = resDisposisi?.ok ? (await resDisposisi.json()).data || [] : [];
            const dataKeluar = resKeluar?.ok ? (await resKeluar.json()).data || [] : [];

            // === SURAT MASUK (via disposisi) ===
            const masuk = dataDisposisi
                .filter(d => {
                    // Cek apakah disposisi ini untuk kepsek
                    const isForKepsek = d.id_kepsek === user.id ||
                        (d.distribusi || []).some(dist => {
                            const jabatan = (dist.jabatan?.nama_jabatan || dist.jabatan || "").toLowerCase();
                            return jabatan === "kepala sekolah";
                        });
                    return isForKepsek;
                })
                .map(d => {
                    const surat = d.surat_masuk || {};
                    const status = d.status_kepsek || d.status || "menunggu";
                    return {
                        jenis: "masuk",
                        id: d.id_surat_masuk || surat.id,
                        no_surat: surat.no_surat,
                        perihal: surat.perihal_surat,
                        asal: surat.asal_surat,
                        tanggal: d.created_at || surat.created_at,
                        status: status,
                        statusLabel: status === "disetujui" ? "Disetujui" :
                            status === "ditolak" ? "Ditolak" : "Menunggu"
                    };
                });

            // === SURAT KELUAR (yang perlu approval kepsek) ===
            const keluar = dataKeluar
                .filter(s => {
                    // Surat keluar yang statusnya butuh approval kepsek
                    // Atau yang sudah di-approve/ditolak oleh kepsek
                    const status = (s.status_verifikasi || "").toLowerCase();
                    const alur = (s.status_alur || "").toLowerCase();
                    // Kepsek handle surat keluar yang menunggu persetujuan atau sudah diproses
                    return ["menunggu", "disetujui", "ditolak"].includes(status) ||
                        ["diproses", "selesai"].includes(alur);
                })
                .map(s => {
                    const status = (s.status_verifikasi || "menunggu").toLowerCase();
                    return {
                        jenis: "keluar",
                        id: s.id_surat_keluar || s.id,
                        no_surat: s.no_surat,
                        perihal: s.perihal,
                        asal: s.tujuan || s.asal || "Internal",
                        tanggal: s.created_at,
                        status: status,
                        statusLabel: status === "disetujui" ? "Disetujui" :
                            status === "ditolak" ? "Ditolak" : "Menunggu"
                    };
                });

            allData = [...masuk, ...keluar].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
            renderTable();

        } catch (err) {
            console.error(err);
            tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:red">Server tidak bisa diakses.</td></tr>`;
        }
    }

    loadHistory();
})();