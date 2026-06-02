// homeKepsek.js — Dashboard Kepala Sekolah

(function () {

    const user = getUser();
    if (!user) { window.location.href = "login.html"; return; }

    const aktif = getActiveJabatan().toLowerCase();
    if (aktif !== "kepala sekolah") { window.location.href = "login.html"; return; }

    const elNama = document.getElementById("namaUser");
    if (elNama) elNama.textContent = user.name;

    const cardContainer = document.querySelector(".card-container");

    function formatTanggal(isoString) {
        if (!isoString || isoString.startsWith("0001")) return "-";
        const date = new Date(isoString);
        return date.toLocaleDateString("id-ID", {
            weekday: "long", day: "numeric", month: "long", year: "numeric"
        });
    }

    function getStatusBadge(status) {
        const map = {
            "menunggu": { cls: "bg-yellow", label: "Menunggu" },
            "belum_dibaca": { cls: "bg-yellow", label: "Menunggu" },
            "sedang_dikerjakan": { cls: "bg-yellow", label: "Diproses" },
            "disetujui": { cls: "bg-green", label: "Disetujui" },
            "ditolak": { cls: "bg-red", label: "Ditolak" },
            "selesai": { cls: "bg-green", label: "Selesai" },
        };
        return map[status] || { cls: "bg-yellow", label: "Menunggu" };
    }

    // Render card disposisi surat masuk
    function renderCardDisposisi(disposisi) {
        const surat = disposisi.surat_masuk || {};
        const status = disposisi.status_approval || "menunggu";
        const { cls, label } = getStatusBadge(status);
        const tanggal = formatTanggal(surat.created_at || disposisi.tanggal_disposisi);
        const isNew = status === "menunggu";

        const noSurat = surat.no_surat || `Surat #${disposisi.id_surat_masuk}`;
        const asal = surat.asal_surat || "-";
        const perihal = surat.perihal_surat || "-";

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
            <span>No. Surat</span><span>: ${noSurat}</span>
            <span>Asal</span><span>: ${asal}</span>
            <span>Perihal</span><span>: ${perihal}</span>
        </p>
        <div class="card-footer">
            <span class="status-badge ${cls}">${label}</span>
            <button class="btn-blue">Lihat</button>
        </div>
        <img src="../assets/mascot1.png" class="maskot" alt="">
    `;

        card.querySelector(".btn-blue").addEventListener("click", () => {
            localStorage.setItem("selectedDisposisiId", disposisi.id);
            localStorage.setItem("selectedSuratId", disposisi.id_surat_masuk ?? disposisi.surat_masuk?.id);
            window.location.href = "disposisi_masuk.html";
        });

        return card;
    }

    // Render card surat keluar pending
    function renderCardKeluar(surat) {
        const status = surat.status_verifikasi || "menunggu";
        const { cls, label } = getStatusBadge(status);
        const tanggal = formatTanggal(surat.created_at);
        const isNew = status === "menunggu";

        const card = document.createElement("article");
        card.className = "card orange";
        card.innerHTML = `
        ${isNew ? '<span class="badge-new">Surat Baru</span>' : ""}
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
            <span>Perihal</span><span>: ${surat.perihal_surat || surat.perihal || "-"}</span>
        </p>
        <div class="card-footer">
            <span class="status-badge ${cls}">${label}</span>
            <button class="btn-blue">Lihat</button>
        </div>
        <img src="../assets/mascot2.png" class="maskot" alt="">
    `;

        card.querySelector(".btn-blue").addEventListener("click", () => {
            localStorage.setItem("selectedSuratId", surat.id_surat_keluar || surat.id);
            localStorage.setItem("selectedSuratType", "keluar");
            window.location.href = "disposisi_keluar.html";
        });

        return card;
    }

    async function loadDashboard() {
        cardContainer.innerHTML = '<p style="padding:1rem">Memuat surat...</p>';

        try {
            const [resDisposisi, resKeluar] = await Promise.all([
                apiListDisposisi(),
                apiListSuratKeluar({ status: "menunggu" })
            ]);

            const disposisis = resDisposisi?.ok ? (await resDisposisi.json()).data || [] : [];
            const suratKeluar = resKeluar?.ok ? (await resKeluar.json()).data || [] : [];

            if (disposisis.length === 0 && suratKeluar.length === 0) {
                cardContainer.innerHTML = '<p style="padding:1rem">Tidak ada surat.</p>';
                return;
            }

            // Kalau surat_masuk tidak ter-preload, fetch detail per surat
            const disposisiDenganSurat = await Promise.all(
                disposisis.map(async (d) => {
                    if (!d.surat_masuk && d.id_surat_masuk) {
                        try {
                            const res = await apiGetSuratMasuk(d.id_surat_masuk);
                            if (res?.ok) {
                                const data = await res.json();
                                d.surat_masuk = data.data;
                            }
                        } catch (e) { /* skip */ }
                    }
                    return d;
                })
            );

            const menunggu = disposisiDenganSurat.filter(d => d.status_approval === "menunggu");
            const lainnya = disposisiDenganSurat.filter(d => d.status_approval !== "menunggu");

            cardContainer.innerHTML = "";
            [...menunggu, ...lainnya].forEach(d => cardContainer.appendChild(renderCardDisposisi(d)));
            suratKeluar.forEach(s => cardContainer.appendChild(renderCardKeluar(s)));

        } catch (err) {
            console.error(err);
            cardContainer.innerHTML = '<p style="padding:1rem;color:red">Server tidak bisa diakses.</p>';
        }
    }

    loadDashboard();

})();