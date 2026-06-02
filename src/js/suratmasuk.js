// suratmasuk.js — Form input surat masuk baru

const KEPSEK_ID = 1;

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
    const asal = document.getElementById("asalSurat").value.trim();
    const no = document.getElementById("noSurat").value.trim();
    const perihal = document.getElementById("perihalSurat").value.trim();
    const tanggal = document.getElementById("tanggalSurat").value;

    if (!asal || !no || !perihal || !tanggal) {
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
        // Step 1: Upload surat masuk
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("no_surat", no);
        formData.append("perihal_surat", perihal);
        formData.append("asal_surat", asal);
        formData.append("tanggal_surat", tanggal);

        const resSurat = await apiUploadSuratMasuk(formData);
        const dataSurat = await resSurat.json();

        console.log("Response upload:", dataSurat); // debug

        if (!resSurat.ok) {
            showAlert(dataSurat.error || "Gagal mengirim surat.");
            btn.disabled = false;
            btn.textContent = "Submit";
            return;
        }

        // ← fix: cek semua kemungkinan field ID
        const suratId = dataSurat.surat?.id
            || dataSurat.surat?.id_surat_masuk
            || dataSurat.id
            || dataSurat.id_surat_masuk;

        console.log("Surat ID:", suratId); // debug

        if (!suratId) {
            showAlert("Surat tersimpan tapi ID tidak ditemukan.");
            btn.disabled = false;
            btn.textContent = "Submit";
            return;
        }

        // Step 2: Buat disposisi ke Kepsek
        // ← fix: tambah sifat="" sebagai parameter ke-3
        const resDisposisi = await apiCreateDisposisi(
            suratId,
            KEPSEK_ID,
            "",                              // sifat
            "Mohon ditinjau dan disetujui"   // catatan
        );

        console.log("Response disposisi:", resDisposisi?.status); // debug

        if (!resDisposisi || !resDisposisi.ok) {
            const errData = resDisposisi ? await resDisposisi.json() : null;
            console.warn("Disposisi gagal:", errData?.error);
            showAlert("Surat tersimpan, tapi gagal dikirim ke Kepsek: " + (errData?.error || "unknown"));
            btn.disabled = false;
            btn.textContent = "Submit";
            return;
        }

        // Step 3: Redirect
        window.location.href = "notifblue.html";

    } catch (err) {
        console.error(err);
        showAlert("Server tidak bisa diakses.");
        btn.disabled = false;
        btn.textContent = "Submit";
    }
});