// output_disposisi_masuk.js — Admin lihat hasil Kepsek + teruskan ke user
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

    document.getElementById("btnKembali")?.addEventListener("click", () => {
        localStorage.removeItem("fromHistory");
        if (fromHistory) {
            window.location.href = "history.html";
        } else {
            window.location.href = getDashboardUrl(getActiveJabatan());
        }
    });

    async function loadDetail() {
        try {
            // Load surat masuk
            const resSurat = await apiGetSuratMasuk(suratId);
            if (resSurat?.ok) {
                const surat = (await resSurat.json()).data;
                document.getElementById("valNoSurat").textContent = surat.no_surat || "-";
                document.getElementById("valTanggal").textContent = formatTanggal(surat.tanggal_surat);
                document.getElementById("valAsal").textContent = surat.asal_surat || "-";
                document.getElementById("valPerihal").textContent = surat.perihal_surat || "-";

                const lampiranBox = document.getElementById("lampiranBox");
                if (lampiranBox && surat.file_pdf) {
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
            }

            // Load disposisi
            const resDisp = await apiGetDisposisi(suratId);
            if (resDisp?.ok) {
                const disp = (await resDisp.json()).data;

                const statusEl = document.getElementById("valStatus");
                if (statusEl) {
                    const statusMap = {
                        "disetujui": { label: "Disetujui", bg: "#3CC15F" },
                        "ditolak": { label: "Ditolak", bg: "#e84848" },
                        "menunggu": { label: "Menunggu", bg: "#E8C048" },
                    };
                    const s = statusMap[disp.status_approval] || statusMap["menunggu"];
                    statusEl.textContent = s.label;
                    statusEl.style.background = s.bg;
                }

                document.getElementById("valKepsek").value = disp.kepsek?.name || disp.kepsek?.nama || "-";
                document.getElementById("valApprovalAt").value = formatTanggal(disp.approval_at);
                document.getElementById("valCatatanKepsek").value = disp.catatan_kepsek || "-";
                document.getElementById("valTanggapan").value = disp.tanggapan_saran || "-";
                document.getElementById("valProses").value = disp.proses_lanjut || "-";
                document.getElementById("valKoordinasi").value = disp.koordinasi_konfirmasi || "-";

                // Tampilkan jabatan penerima dari distribusi
                const valJabatanPenerima = document.getElementById("valJabatanPenerima");
                if (valJabatanPenerima && disp.distribusi && disp.distribusi.length > 0) {
                    valJabatanPenerima.innerHTML = disp.distribusi.map(d => `
                        <span style="background:rgba(26,115,232,0.8);color:white;padding:5px 12px;
                            border-radius:20px;font-size:13px;">
                            ${d.jabatan?.nama_jabatan || 'Jabatan #' + d.id_jabatan}
                        </span>
                    `).join("");
                }
                const btnTeruskan = document.getElementById("btnTeruskan");

                if (!fromHistory && disp.status_approval === "disetujui" && disp.status_disposisi !== "selesai") {
                    const areaTeruskan = document.getElementById("areaTeruskan"); // ← tambah ini
                    if (areaTeruskan) areaTeruskan.style.display = "block";       // ← tambah ini
                    if (btnTeruskan) btnTeruskan.style.display = "inline-block";

                    btnTeruskan?.addEventListener("click", async () => {
                        btnTeruskan.disabled = true;
                        btnTeruskan.textContent = "Meneruskan...";
                        try {
                            const res = await fetch("http://localhost:7000/disposisi/teruskan-user", {
                                method: "POST",
                                headers: {
                                    "Content-Type": "application/json",
                                    "Authorization": "Bearer " + localStorage.getItem("token")
                                },
                                body: JSON.stringify({
                                    disposisi_id: disp.id_disposisi || disp.id
                                })
                            });
                            if (res.ok) {
                                localStorage.removeItem("selectedSuratId");
                                localStorage.removeItem("selectedDisposisiId");
                                window.location.href = "notifblue.html?tipe=teruskan";
                            } else {
                                const err = await res.json();
                                showAlert(err.error || "Gagal meneruskan surat.");
                                btnTeruskan.disabled = false;
                                btnTeruskan.textContent = "→ Teruskan";
                            }
                        } catch (e) {
                            console.error(e);
                            showAlert("Server tidak bisa diakses.");
                            btnTeruskan.disabled = false;
                            btnTeruskan.textContent = "→ Teruskan";
                        }
                    });

                } else {
                    const areaTeruskan = document.getElementById("areaTeruskan"); // ← tambah ini
                    if (areaTeruskan) areaTeruskan.style.display = "none";        // ← tambah ini
                    if (btnTeruskan) btnTeruskan.style.display = "none";
                }
            }

        } catch (err) {
            console.error(err);
        }
    }

    loadDetail();

})();