// output_disposisi_keluar.js — TU lihat hasil keputusan Kepsek untuk surat keluar
(function () {
    const user = getUser();
    if (!user) { window.location.href = "login.html"; return; }

    const suratId = localStorage.getItem("selectedSuratId");
    const fromHistory = localStorage.getItem("fromHistory") === "true";

    if (!suratId) { window.location.href = "home.html"; return; }

    function formatTanggal(iso) {
        if (!iso || iso.startsWith("0001")) return "-";
        return new Date(iso).toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric"
        });
    }

    async function loadDetail() {
        try {
            const res = await apiGetSuratKeluar(suratId);
            if (!res?.ok) return;

            const surat = (await res.json()).data;

            document.getElementById("valNoSurat").textContent = surat.no_surat || "-";
            document.getElementById("valKode").textContent = surat.kode_surat || "-";
            document.getElementById("valPerihal").textContent = surat.perihal || "-";
            document.getElementById("valTujuan").textContent = surat.tujuan || "-";
            document.getElementById("valTanggal").textContent = formatTanggal(surat.tanggal_surat);

            const lampiranBox = document.getElementById("lampiranBox");
            if (surat.file_pdf) {
                const namaFile = surat.file_pdf.split(/[\\/]/).pop();
                lampiranBox.innerHTML = `
                    <p style="font-size:16px;font-weight:bold">📄 ${namaFile}</p>
                    <p style="font-size:13px;margin-top:8px;opacity:0.8">Klik untuk membuka PDF</p>
                `;
                lampiranBox.style.cursor = "pointer";
                lampiranBox.onclick = () => {
                    window.open("http://localhost:7000/" + surat.file_pdf.replace(/\\/g, "/"), "_blank");
                };
            }

            const statusEl = document.getElementById("valStatus");
            if (statusEl) {
                const statusMap = {
                    "disetujui": { label: "Disetujui", bg: "#3CC15F" },
                    "ditolak": { label: "Ditolak", bg: "#e84848" },
                    "menunggu": { label: "Menunggu", bg: "#E8C048" },
                };
                const s = statusMap[surat.status_verifikasi] || statusMap["menunggu"];
                statusEl.textContent = s.label;
                statusEl.style.background = s.bg;
            }

            document.getElementById("valKepsek").value =
                surat.verifikator?.name || surat.verifikator?.nama || "-";
            document.getElementById("valApprovalAt").value =
                formatTanggal(surat.tanggal_verifikasi);
            document.getElementById("valCatatan").value =
                surat.catatan_verifikasi || "-";

        } catch (err) {
            console.error(err);
        }
    }

    // Tombol kembali — sesuai dari mana dibuka
    document.getElementById("btnKembali")?.addEventListener("click", () => {
        localStorage.removeItem("fromHistory");
        if (fromHistory) {
            window.location.href = "history.html";
        } else {
            window.location.href = getDashboardUrl(getActiveJabatan());
        }
    });

    loadDetail();
})();