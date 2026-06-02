// history_user.js — Riwayat surat untuk User biasa (Waka/BKK/etc)
(function () {
    const user = getUser();
    if (!user) { window.location.href = "login.html"; return; }

    const aktif = getActiveJabatan().toLowerCase();
    if (aktif === "admin" || aktif === "pegawai") { window.location.href = "login.html"; return; }
    if (aktif === "kepala sekolah") { window.location.href = "login.html"; return; }

    const tbody = document.getElementById("tableBody");
    const filterJabatanEl = document.getElementById("filterJabatan");

    let allData = [];
    let activeTab = "semua";
    let activeStatus = "semua";
    let activeJabatan = "semua";
    let searchQuery = "";

    // AMBIL SEMUA JABATAN USER
    const userJabatanList = (user.jabatans || []).map(j => ({
        original: j,
        lower: j.toLowerCase().trim(),
        upper: j.toUpperCase()
    }));

    // ISI DROPDOWN FILTER JABATAN
    function initJabatanFilter() {
        userJabatanList.forEach(j => {
            const opt = document.createElement("option");
            opt.value = j.lower;
            opt.textContent = j.upper;
            filterJabatanEl.appendChild(opt);
        });
    }

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

    // 🔥 FUNGSI AMBIL JABATAN DARI DISPOSISI (dengan fallback)
    function extractJabatans(d) {
        // Coba dari distribusi dulu
        let jabatans = [];

        if (d.distribusi && Array.isArray(d.distribusi) && d.distribusi.length > 0) {
            jabatans = d.distribusi
                .map(dist => {
                    // Coba berbagai kemungkinan struktur
                    if (dist.jabatan?.nama_jabatan) return dist.jabatan.nama_jabatan;
                    if (typeof dist.jabatan === 'string') return dist.jabatan;
                    if (dist.nama_jabatan) return dist.nama_jabatan;
                    if (dist.jabatan_penerima) return dist.jabatan_penerima;
                    return "";
                })
                .filter(Boolean)
                .map(j => j.toLowerCase().trim());
        }

        // 🔥 FALLBACK: Kalau distribusi kosong, coba dari field lain
        if (jabatans.length === 0) {
            // Coba dari id_jabatan_penerima atau field serupa
            if (d.id_jabatan_penerima || d.jabatan_penerima) {
                const fallbackJabatan = (d.jabatan_penerima_nama || d.nama_jabatan_penerima || "");
                if (fallbackJabatan) jabatans.push(fallbackJabatan.toLowerCase().trim());
            }
            // Coba dari penerima
            if (d.penerima?.jabatan?.nama_jabatan) {
                jabatans.push(d.penerima.jabatan.nama_jabatan.toLowerCase().trim());
            }
        }

        // 🔥 FALLBACK TERAKHIR: Kalau masih kosong, anggap semua jabatan user terlibat
        if (jabatans.length === 0) {
            jabatans = userJabatanList.map(j => j.lower);
        }

        return jabatans;
    }

    function renderTable() {
        let filtered = allData.filter(row => {
            if (activeTab !== "semua" && row.jenis !== activeTab) return false;
            if (activeStatus !== "semua" && row.status !== activeStatus) return false;
            if (activeJabatan !== "semua" && !row.jabatans.includes(activeJabatan)) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                if (!row.no_surat?.toLowerCase().includes(q) &&
                    !row.perihal?.toLowerCase().includes(q) &&
                    !row.asal?.toLowerCase().includes(q)) return false;
            }
            return true;
        });

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:1rem">Tidak ada data.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtered.map((row, i) => `
            <tr data-status="${row.status}" data-jenis="${row.jenis}">
                <td>${i + 1}</td>
                <td>Surat Masuk</td>
                <td>${formatTanggal(row.tanggal)}</td>
                <td>${formatWaktu(row.tanggal)}</td>
                <td>${row.no_surat || "-"}</td>
                <td>${row.asal || "-"}</td>
                <td>${row.perihal || "-"}</td>
                <td><span class="jabatan-badge-table">${row.jabatanLabels}</span></td>
                <td><span class="status ${row.status === 'diteruskan' || row.status === 'selesai' ? 'ok' : 'wait'}">
                    ${row.statusLabel}
                </span></td>
                <td><button class="btn-view" data-id="${row.id}">Lihat</button></td>
            </tr>
        `).join("");

        tbody.querySelectorAll(".btn-view").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = btn.dataset.id;
                localStorage.setItem("selectedSuratId", id);
                localStorage.setItem("selectedSuratType", "masuk");
                localStorage.setItem("fromHistory", "true");
                window.location.href = "detail_user.html";
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

    filterJabatanEl?.addEventListener("change", e => {
        activeJabatan = e.target.value;
        renderTable();
    });

    document.getElementById("filterStatus")?.addEventListener("change", e => {
        activeStatus = e.target.value;
        renderTable();
    });

    document.querySelector(".search")?.addEventListener("input", e => {
        searchQuery = e.target.value.trim();
        renderTable();
    });

    async function loadHistory() {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;padding:1rem">Memuat...</td></tr>`;
        try {
            const res = await apiListDisposisi();
            if (!res || !res.ok) {
                tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:red">Gagal memuat data.</td></tr>`;
                return;
            }

            const data = (await res.json()).data || [];

            // 🔥 DEBUG: Lihat struktur data
            console.log("Sample data:", data[0]);
            console.log("Distribusi:", data[0]?.distribusi);
            console.log("User jabatans:", user.jabatans);

            allData = data
                .filter(d => {
                    // Ambil semua jabatan dari disposisi
                    const jabatans = extractJabatans(d);

                    // Cek apakah ada jabatan yang cocok dengan user
                    const matching = jabatans.filter(j =>
                        userJabatanList.some(uj => uj.lower === j)
                    );

                    // 🔥 DEBUG
                    if (matching.length > 0) {
                        console.log("Match found:", d.id_surat_masuk, "jabatans:", jabatans, "matching:", matching);
                    }

                    return matching.length > 0;
                })
                .map(d => {
                    const surat = d.surat_masuk || {};

                    // Ambil jabatan yang cocok dengan user
                    const jabatans = extractJabatans(d);
                    const matchingJabatans = jabatans.filter(j =>
                        userJabatanList.some(uj => uj.lower === j)
                    );

                    const jabatanLabels = [...new Set(matchingJabatans)]
                        .map(j => userJabatanList.find(uj => uj.lower === j)?.upper || j.toUpperCase())
                        .join(" / ");

                    // 🔥 STATUS: Kalau sudah masuk history user, berarti sudah diteruskan
                    // Cek dari berbagai kemungkinan field status
                    let status = "diteruskan"; // default: sudah diteruskan

                    const rawStatus = (d.status_alur || d.status || "").toLowerCase();

                    if (rawStatus === "selesai") {
                        status = "selesai";
                    } else if (rawStatus === "diteruskan" || rawStatus === "disetujui" || rawStatus === "diterima") {
                        status = "diteruskan";
                    } else if (rawStatus === "menunggu" || rawStatus === "pending") {
                        // Kalau masih menunggu tapi sudah ada di list user, anggap diteruskan
                        status = "diteruskan";
                    } else {
                        status = "diteruskan"; // fallback
                    }

                    return {
                        jenis: "masuk",
                        id: d.id_surat_masuk || surat.id,
                        no_surat: surat.no_surat,
                        perihal: surat.perihal_surat,
                        asal: surat.asal_surat,
                        tanggal: d.created_at || surat.created_at,
                        status: status,
                        statusLabel: status === "selesai" ? "Selesai" : "Diteruskan",
                        jabatans: matchingJabatans,
                        jabatanLabels: jabatanLabels || userJabatanList.map(j => j.upper).join(" / ")
                    };
                });

            allData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
            renderTable();

        } catch (err) {
            console.error(err);
            tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:red">Server tidak bisa diakses.</td></tr>`;
        }
    }

    // INIT
    initJabatanFilter();
    loadHistory();
})();