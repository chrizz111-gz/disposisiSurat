// detailkeluar.js — Load data surat keluar read-only

function showAlert(msg) {
    document.getElementById("alertMessage").innerText = msg;
    document.getElementById("customAlert").style.display = "flex";
}
function closeAlert() {
    document.getElementById("customAlert").style.display = "none";
}

document.getElementById("btnKembali").addEventListener("click", () => {
    localStorage.removeItem("selectedSuratId");
    localStorage.removeItem("selectedSuratType");
    window.location.href = "home.html";
});

async function loadDetail() {
    const suratId = localStorage.getItem("selectedSuratId");
    if (!suratId) { window.location.href = "home.html"; return; }

    try {
        const res = await apiGetSuratKeluar(suratId);
        if (!res || !res.ok) { showAlert("Gagal memuat data."); return; }

        const surat = (await res.json()).data;

        document.getElementById("tujuanSurat").value = surat.tujuan || "";
        document.getElementById("kodeSurat").value = surat.kode_surat || "";
        document.getElementById("noSurat").value = surat.no_surat || "";
        document.getElementById("perihalSurat").value = surat.perihal || "";
        if (surat.tanggal_surat) {
            document.getElementById("tanggalSurat").value = surat.tanggal_surat.split("T")[0];
        }

        // Preview file — tanpa status surat
        const preview = document.getElementById("previewBox");
        if (preview && surat.file_pdf) {
            const nama = surat.file_pdf.split("/").pop();
            preview.innerHTML = `
                <span class="file-icon">📄</span>
                <span class="file-name">${nama}</span>
            `;
        }

    } catch (err) {
        console.error(err);
        showAlert("Server tidak bisa diakses.");
    }
}

loadDetail();