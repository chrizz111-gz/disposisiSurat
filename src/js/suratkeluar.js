// suratkeluar.js — Form input surat keluar baru

const KEPSEK_ID = 1; // ID Kepala Sekolah di database

let redirectUrl = "";
function showAlert(msg, url = "") {
    document.getElementById("alertMessage").innerText = msg;
    document.getElementById("customAlert").style.display = "flex";
    redirectUrl = url;
}
function closeAlert() {
    document.getElementById("customAlert").style.display = "none";
    if (redirectUrl) window.location.href = redirectUrl;
}

let selectedFile = null;

document.getElementById("btnUpload").addEventListener("click", () => {
    document.getElementById("fileSurat").click();
});

document.getElementById("fileSurat").addEventListener("change", (e) => {
    selectedFile = e.target.files[0];
    const preview = document.querySelector(".preview-box");
    if (selectedFile && preview) {
        const sizeMB = (selectedFile.size / 1024 / 1024).toFixed(2);
        preview.innerHTML = `
            <span class="file-icon">📄</span>
            <span class="file-name">${selectedFile.name}</span>
            <span style="font-size:12px;color:rgba(255,255,255,0.8)">${sizeMB} MB</span>
        `;
    }
});

document.getElementById("btnSubmit").addEventListener("click", async () => {
    const tujuan = document.getElementById("tujuanSurat").value.trim();
    const kode = document.getElementById("kodeSurat").value.trim();
    const no = document.getElementById("noSurat").value.trim();
    const perihal = document.getElementById("perihalSurat").value.trim();
    const tanggal = document.getElementById("tanggalSurat").value;

    if (!tujuan || !no || !perihal || !tanggal) {
        showAlert("Semua field wajib diisi.");
        return;
    }
    if (!selectedFile) {
        showAlert("File PDF wajib diupload.");
        return;
    }

    const btn = document.getElementById("btnSubmit");
    btn.disabled = true;
    btn.textContent = "Mengirim...";

    try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("tujuan", tujuan);
        const kodeVal = parseInt(kode);
        formData.append("kode_surat", isNaN(kodeVal) ? 0 : kodeVal);
        formData.append("no_surat", no);
        formData.append("perihal", perihal);
        formData.append("tanggal_surat", tanggal);

        const resSurat = await apiUploadSuratKeluar(formData);
        const dataSurat = await resSurat.json();
        console.log("Error detail:", dataSurat);

        if (!resSurat.ok) {
            showAlert(dataSurat.error || "Gagal mengirim surat.");
            btn.disabled = false;
            btn.textContent = "Submit";
            return;
        }

        const suratId = dataSurat.surat?.id_surat_keluar || dataSurat.id_surat_keluar;
        localStorage.setItem("selectedSuratKeluarId", suratId);
        window.location.href = "notiforange.html";

    } catch (err) {
        console.error(err);
        showAlert("Server tidak bisa diakses.");
        btn.disabled = false;
        btn.textContent = "Submit";
    }
});