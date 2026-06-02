// homeWaka.js — Dashboard Waka (tambah catatan + teruskan ke user)
(function () {
    const user = getUser();
    if (!user) { window.location.href = "login.html"; return; }

    const cardContainer = document.querySelector(".card-container");

    function formatTanggal(isoString) {
        if (!isoString) return "-";
        const date = new Date(isoString);
        if (isNaN(date.getTime()) || date.getFullYear() < 2000) return "-";
        return date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    }

    function getStatusBadge(status) {
        const map = {
            "menunggu": { cls: "bg-yellow", label: "Menunggu" },
            "belum_dibaca": { cls: "bg-yellow", label: "Menunggu" },
            "sedang_dikerjakan": { cls: "bg-yellow", label: "Diproses" },
            "selesai": { cls: "bg-green", label: "Selesai" },
        };
        return map[status] || { cls: "bg-yellow", label: status };
    }

    function renderCard(disposisi) {
        const surat = disposisi.surat_masuk || {};
        const status = disposisi.status_disposisi || "belum_dibaca";
        const { cls, label } = getStatusBadge(status);
        const tanggal = formatTanggal(surat.created_at);
        const isNew = status !== "selesai";

        const card = document.createElement("article");
        card.className = "card blue";
        card.innerHTML = `
            ${isNew ? '<span class="badge-new">Perlu Tindakan</span>' : ""}
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
                <span>Catatan Kepsek</span><span>: ${disposisi.catatan_kepsek || "-"}</span>
            </p>
            <div class="card-footer">
                <span class="status-badge ${cls}">${label}</span>
                <button class="btn-blue" onclick="lihatDisposisi(${disposisi.id_disposisi}, ${surat.id_surat_masuk})">Lihat</button>
            </div>
            <img src="../assets/mascot1.png" class="maskot" alt="">
        `;
        return card;
    }

    window.lihatDisposisi = function (disposisiId, suratId) {
        localStorage.setItem("selectedDisposisiId", disposisiId);
        localStorage.setItem("selectedSuratId", suratId);
        window.location.href = "disposisi_masuk.html";
    };

    async function loadDashboard() {
        cardContainer.innerHTML = '<p style="padding:1rem">Memuat surat...</p>';
        try {
            const res = await apiListDisposisi();
            const data = res?.ok ? (await res.json()).data || [] : [];

            if (data.length === 0) {
                cardContainer.innerHTML = '<p style="padding:1rem">Tidak ada disposisi.</p>';
                return;
            }

            // Yang belum selesai duluan
            const belum = data.filter(d => d.status_disposisi !== "selesai");
            const selesai = data.filter(d => d.status_disposisi === "selesai");

            cardContainer.innerHTML = "";
            [...belum, ...selesai].forEach(d => cardContainer.appendChild(renderCard(d)));
        } catch (err) {
            console.error(err);
            cardContainer.innerHTML = '<p style="padding:1rem;color:red">Server tidak bisa diakses.</p>';
        }
    }

    loadDashboard();
})();