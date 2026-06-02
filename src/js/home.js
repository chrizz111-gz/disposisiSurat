// home.js — Dashboard Admin/Pegawai TU
(function () {
    const user = getUser();
    if (!user) { window.location.href = "login.html"; return; }

    const aktif = getActiveJabatan().toLowerCase();
    if (aktif !== "admin" && aktif !== "pegawai") {
        window.location.href = getDashboardUrl(aktif);
        return;
    }

    const cardContainer = document.querySelector(".card-container");

    function formatTanggal(isoString) {
        if (!isoString) return "-";
        const date = new Date(isoString);
        return date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }

    function getStatusBadge(status) {
        const map = {
            "menunggu": { cls: "bg-yellow", label: "Menunggu" },
            "diterima_tu": { cls: "bg-yellow", label: "Menunggu" },
            "disposisi_kepsek": { cls: "bg-yellow", label: "Menunggu" },
            "diteruskan": { cls: "bg-green", label: "Diteruskan" },
            "disetujui": { cls: "bg-green", label: "Disetujui" },
            "ditolak": { cls: "bg-red", label: "Ditolak" },
            "selesai": { cls: "bg-green", label: "Selesai" },
        };
        return map[status] || { cls: "bg-yellow", label: "Menunggu" };
    }

    function renderCardMasuk(surat) {
        const status = surat.status_verifikasi || surat.status_alur || "menunggu";
        const { cls, label } = getStatusBadge(status);
        const tanggal = formatTanggal(surat.created_at);
        const isNew = ["disetujui", "ditolak"].includes(surat.status_verifikasi);
        const suratId = surat.id_surat_masuk || surat.id;
        const disposisiAktif = surat.id_disposisi_aktif || null;

        const card = document.createElement("article");
        card.className = "card blue";
        card.innerHTML = `
            ${isNew ? '<span class="badge-new">Surat Baru</span>' : ""}
            <div class="card-header">
                <span class="tanggal">${tanggal}</span>
                <span class="title">
                    <img src="../assets/surat-masuk.png" class="title-icon" alt="">
                    SURAT MASUK
                </span>
            </div>
            <p class="detail-surat">
                <span>No. Surat</span><span>: ${surat.no_surat || "-"}</span>
                <span>Asal</span><span>: ${surat.asal_surat || "-"}</span>
                <span>Perihal</span><span>: ${surat.perihal_surat || "-"}</span>
            </p>
            <div class="card-footer">
                <span class="status-badge ${cls}">${label}</span>
                <button class="btn-blue">Lihat</button>
            </div>
            <img src="../assets/mascot1.png" class="maskot" alt="">
        `;

        card.querySelector(".btn-blue").addEventListener("click", () => {
            lihatSuratMasuk(suratId, disposisiAktif);
        });

        return card;
    }

    function renderCardKeluar(surat) {
        const status = surat.status_verifikasi || "menunggu";
        const { cls, label } = getStatusBadge(status);
        const tanggal = formatTanggal(surat.created_at);
        const sudahDiproses = ["disetujui", "ditolak"].includes(surat.status_verifikasi);
        const suratId = surat.id_surat_keluar || surat.id;

        const card = document.createElement("article");
        card.className = "card orange";
        card.innerHTML = `
            ${sudahDiproses ? '<span class="badge-new">Surat Baru</span>' : ""}
            <div class="card-header">
                <span class="tanggal">${tanggal}</span>
                <span class="title">
                    <img src="../assets/surat-keluar.png" class="title-icon" alt="">
                    SURAT KELUAR
                </span>
            </div>
            <p class="detail-surat">
                <span>No. Surat</span><span>: ${surat.no_surat || "-"}</span>
                <span>Tujuan</span><span>: ${surat.tujuan || "-"}</span>
                <span>Perihal</span><span>: ${surat.perihal || "-"}</span>
            </p>
            <div class="card-footer">
                <span class="status-badge ${cls}">${label}</span>
                <button class="btn-blue">Lihat</button>
            </div>
            <img src="../assets/mascot2.png" class="maskot" alt="">
        `;

        card.querySelector(".btn-blue").addEventListener("click", async () => {
            localStorage.setItem("selectedSuratId", suratId);
            localStorage.setItem("selectedSuratType", "keluar");
            localStorage.setItem("fromHistory", "false");

            if (sudahDiproses) {
                // Mark selesai dulu kalau ada fungsinya
                if (typeof apiSelesaikanSuratKeluar === "function") {
                    await apiSelesaikanSuratKeluar(suratId);
                }
                card.style.transition = "opacity 0.3s";
                card.style.opacity = "0";
                setTimeout(() => {
                    card.remove();
                    window.location.href = "output_disposisi_keluar.html";
                }, 300);
            } else {
                window.location.href = "detailkeluar.html";
            }
        });

        return card;
    }

    function lihatSuratMasuk(suratId, disposisiId) {
        localStorage.setItem("selectedSuratId", suratId);
        localStorage.setItem("selectedSuratType", "masuk");
        localStorage.setItem("fromHistory", "false");

        if (disposisiId && disposisiId !== "null") {
            localStorage.setItem("selectedDisposisiId", disposisiId);
            window.location.href = "output_disposisi_masuk.html";
        } else {
            window.location.href = "detailmasuk.html";
        }
    }

    async function loadSurat() {
        cardContainer.innerHTML = '<p style="padding:1rem">Memuat surat...</p>';
        try {
            const [resMasuk, resKeluar] = await Promise.all([
                apiListSuratMasuk(),
                apiListSuratKeluar()
            ]);

            const dataMasuk = resMasuk?.ok ? (await resMasuk.json()).data || [] : [];
            const dataKeluar = resKeluar?.ok ? (await resKeluar.json()).data || [] : [];

            if (dataMasuk.length === 0 && dataKeluar.length === 0) {
                cardContainer.innerHTML = '<p style="padding:1rem">Belum ada surat.</p>';
                return;
            }

            // Dashboard hanya tampilkan yang belum selesai/diteruskan
            const semua = [
                ...dataMasuk
                    .filter(s => !["diteruskan", "selesai"].includes(s.status_alur))
                    .map(s => ({ ...s, _jenis: "masuk" })),
                ...dataKeluar
                    .filter(s => s.status_alur !== "selesai")
                    .map(s => ({ ...s, _jenis: "keluar" }))
            ];

            if (semua.length === 0) {
                cardContainer.innerHTML = '<p style="padding:1rem">Semua surat sudah diproses.</p>';
                return;
            }

            cardContainer.innerHTML = "";
            semua.forEach(s => {
                cardContainer.appendChild(s._jenis === "masuk" ? renderCardMasuk(s) : renderCardKeluar(s));
            });

        } catch (err) {
            console.error(err);
            cardContainer.innerHTML = '<p style="padding:1rem;color:red">Server tidak bisa diakses.</p>';
        }
    }

    loadSurat();

})();