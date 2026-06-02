// detailmasuk.js — Halaman detail surat masuk (read-only)
(function () {

    const user = getUser();
    if (!user) { window.location.href = "login.html"; return; }

    const suratId = localStorage.getItem("selectedSuratId");
    if (!suratId) { window.location.href = "home.html"; return; }

    // Tombol kembali
    const btnKembali = document.getElementById("btnKembali");
    if (btnKembali) {
        btnKembali.addEventListener("click", () => {
            const aktif = getActiveJabatan().toLowerCase();
            window.location.href = getDashboardUrl(aktif);
        });
    }

    // Load data surat dari API
    async function loadDetail() {
        try {
            const res = await apiGetSuratMasuk(suratId);
            if (!res || !res.ok) {
                showAlert("Surat tidak ditemukan.");
                return;
            }

            const data = await res.json();
            const surat = data.data;

            // Isi form
            document.getElementById("asalSurat").value = surat.asal_surat || "-";
            document.getElementById("noSurat").value = surat.no_surat || "-";
            document.getElementById("perihalSurat").value = surat.perihal_surat || "-";
            document.getElementById("tanggalSurat").value = surat.tanggal_surat
                ? surat.tanggal_surat.split("T")[0]
                : "";

            // Preview file PDF
            const previewBox = document.getElementById("previewBox");
            if (previewBox && surat.file_pdf) {
                const namaFile = surat.file_pdf.split(/[\\/]/).pop();
                previewBox.innerHTML = `
                    <span class="file-icon">📄</span>
                    <span class="file-name">${namaFile}</span>
                    <a href="http://localhost:7000/${surat.file_pdf}" target="_blank"
                       style="font-size:12px;color:#2B6F8B;margin-left:8px;">Buka PDF</a>
                `;
            }

        } catch (err) {
            console.error(err);
            showAlert("Server tidak bisa diakses.");
        }
    }

    // Alert helper
    let redirectUrl = "";
    window.showAlert = function (msg, url = "") {
        document.getElementById("alertMessage").innerText = msg;
        document.getElementById("customAlert").style.display = "flex";
        redirectUrl = url;
    };
    window.closeAlert = function () {
        document.getElementById("customAlert").style.display = "none";
        if (redirectUrl) window.location.href = redirectUrl;
    };

    loadDetail();

})();