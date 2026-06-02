// disposisi_keluar.js — Kepsek approve/reject surat keluar
(function () {
    const user = getUser();
    if (!user) { window.location.href = "login.html"; return; }

    const suratId = localStorage.getItem("selectedSuratId");
    if (!suratId) { window.location.href = "homeKepsek.html"; return; }

    let redirectUrl = "";
    function showAlert(msg, url = "") {
        document.getElementById("alertMessage").innerText = msg;
        document.getElementById("customAlert").style.display = "flex";
        redirectUrl = url;
    }
    window.closeAlert = function () {
        document.getElementById("customAlert").style.display = "none";
        if (redirectUrl) window.location.href = redirectUrl;
    };

    function formatTanggal(iso) {
        if (!iso) return "-";
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
            document.getElementById("valTanggal").textContent = formatTanggal(surat.tanggal_surat);
            document.getElementById("valTujuan").textContent = surat.tujuan || "-";
            document.getElementById("valPerihal").textContent = surat.perihal || "-";

            const lampiranBox = document.getElementById("lampiranBox");
            if (surat.file_pdf) {
                const namaFile = surat.file_pdf.split(/[\\/]/).pop();
                lampiranBox.innerHTML = `
                    <p style="font-size:16px;font-weight:bold">📄 ${namaFile}</p>
                    <p style="font-size:13px;margin-top:8px;opacity:0.8">Klik untuk membuka PDF</p>
                `;
                lampiranBox.style.cursor = "pointer";
                lampiranBox.onclick = () => {
                    window.open("http://localhost:7000/" + surat.file_pdf, "_blank");
                };
            } else {
                lampiranBox.innerHTML = `<p>Tidak ada lampiran</p>`;
            }

        } catch (err) {
            console.error(err);
        }
    }

    const statusSurat = document.getElementById("statusSurat");
    const formTerima = document.getElementById("formTerima");
    const formTolak = document.getElementById("formTolak");
    const buttonArea = document.getElementById("buttonArea");

    statusSurat.addEventListener("change", function () {
        formTerima.classList.add("hidden");
        formTolak.classList.add("hidden");
        buttonArea.classList.add("hidden");

        if (this.value === "terima") {
            formTerima.classList.remove("hidden");
            buttonArea.classList.remove("hidden");
        } else if (this.value === "tolak") {
            formTolak.classList.remove("hidden");
            buttonArea.classList.remove("hidden");
        }
    });

    document.getElementById("btnTeruskan").addEventListener("click", async () => {
        const status = statusSurat.value;
        if (!status) { showAlert("Pilih status surat terlebih dahulu."); return; }

        const isApproved = status === "terima";
        const catatan = isApproved
            ? (document.getElementById("catatanTerima")?.value.trim() || "")
            : (document.getElementById("catatanTolak")?.value.trim() || "");

        if (!isApproved && !catatan) {
            showAlert("Masukkan alasan penolakan."); return;
        }

        const btn = document.getElementById("btnTeruskan");
        btn.disabled = true;
        btn.textContent = "Memproses...";

        try {
            const res = await apiApproveSuratKeluar(parseInt(suratId), isApproved, catatan);

            if (!res || !res.ok) {
                const data = await res?.json();
                showAlert(data?.error || "Gagal memproses surat.");
                btn.disabled = false;
                btn.textContent = "← Teruskan";
                return;
            }

            localStorage.removeItem("selectedSuratId");
            localStorage.removeItem("selectedSuratType");

            if (isApproved) {
                window.location.href = "notiforange.html?tipe=kepsek-setujui";
            } else {
                window.location.href = "homeKepsek.html";
            }

        } catch (err) {
            console.error(err);
            showAlert("Server tidak bisa diakses.");
            btn.disabled = false;
            btn.textContent = "← Teruskan";
        }
    });

    document.querySelector(".btn-back")?.addEventListener("click", () => {
        window.location.href = "homeKepsek.html";
    });

    loadDetail();
})();