// disposisi_masuk.js — Kepsek lihat & approve/reject surat masuk
(function () {

    const user = getUser();
    if (!user) { window.location.href = "login.html"; return; }

    const disposisiId = localStorage.getItem("selectedDisposisiId");
    const suratId = localStorage.getItem("selectedSuratId");

    if (!disposisiId || !suratId) {
        window.location.href = "homeKepsek.html"; return;
    }

    let allJabatans = [];
    let pilihanJabatan = [];

    // Alert
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

    function formatTanggal(iso) {
        if (!iso) return "-";
        return new Date(iso).toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric"
        });
    }

    function renderDropdown(keyword) {
        const dropdownJabatan = document.getElementById("dropdownJabatan");
        if (!keyword) { dropdownJabatan.style.display = "none"; return; }
        const filtered = allJabatans.filter(j =>
            j.nama_jabatan.toLowerCase().includes(keyword.toLowerCase()) &&
            !pilihanJabatan.find(p => p.id === j.id_jabatan)
        );
        if (filtered.length === 0) {
            dropdownJabatan.innerHTML = `<div style="padding:10px 14px;color:#aaa;font-size:14px;">Tidak ada hasil</div>`;
            dropdownJabatan.style.display = "block";
            return;
        }
        dropdownJabatan.innerHTML = filtered.map(j => `
            <div onclick="pilihJabatan(${j.id_jabatan}, '${j.nama_jabatan}', ${j.punya_user})"
                style="padding:10px 14px;cursor:pointer;color:${j.punya_user ? 'white' : '#aaa'};
                font-size:14px;border-bottom:1px solid rgba(255,255,255,0.08);"
                onmouseover="this.style.background='rgba(255,255,255,0.08)'"
                onmouseout="this.style.background='transparent'">
                ${j.nama_jabatan}
                ${!j.punya_user ? '<span style="font-size:11px;color:#ff8a80;margin-left:6px;">(belum ada user)</span>' : ''}
            </div>
        `).join("");
        dropdownJabatan.style.display = "block";
    }

    window.pilihJabatan = function (id, nama, punyaUser) {
        if (!punyaUser) {
            showAlert("Jabatan '" + nama + "' belum memiliki user terdaftar.");
            return;
        }
        if (!pilihanJabatan.find(p => p.id === id)) {
            pilihanJabatan.push({ id, nama });
            renderTags();
        }
        document.getElementById("searchJabatan").value = "";
        document.getElementById("dropdownJabatan").style.display = "none";
    };

    window.hapusJabatan = function (id) {
        pilihanJabatan = pilihanJabatan.filter(p => p.id !== id);
        renderTags();
    };

    function renderTags() {
        document.getElementById("selectedJabatans").innerHTML = pilihanJabatan.map(p => `
            <span style="background:rgba(26,115,232,0.8);color:white;padding:5px 12px;
                border-radius:20px;font-size:13px;display:inline-flex;align-items:center;gap:6px;">
                ${p.nama}
                <span onclick="hapusJabatan(${p.id})"
                    style="cursor:pointer;font-size:17px;line-height:1;opacity:0.8;"
                    onmouseover="this.style.opacity='1'"
                    onmouseout="this.style.opacity='0.8'">×</span>
            </span>
        `).join("");
    }

    // Load jabatan dari API
    async function loadJabatan() {
        try {
            const res = await fetch("http://localhost:7000/jabatan", {
                headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
            });
            if (res.ok) {
                allJabatans = (await res.json()).data || [];
            }
        } catch (e) {
            console.error("Gagal load jabatan:", e);
        }
    }

    const searchJabatan = document.getElementById("searchJabatan");
    searchJabatan?.addEventListener("input", () => renderDropdown(searchJabatan.value));
    document.addEventListener("click", (e) => {
        if (!e.target.closest("#dropdownJabatan") && e.target !== searchJabatan) {
            document.getElementById("dropdownJabatan").style.display = "none";
        }
    });

    async function loadDetail() {
        try {
            const resSurat = await apiGetSuratMasuk(suratId);
            if (resSurat?.ok) {
                const surat = (await resSurat.json()).data;
                document.getElementById("valNoSurat").textContent = surat.no_surat || "-";
                document.getElementById("valTanggal").textContent = formatTanggal(surat.tanggal_surat);
                document.getElementById("valAsal").textContent = surat.asal_surat || "-";
                document.getElementById("valPerihal").textContent = surat.perihal_surat || "-";

                if (surat.file_pdf) {
                    const lampiranBox = document.getElementById("lampiranBox");
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
        const btn = document.getElementById("btnTeruskan");

        let body = {
            disposisi_id: parseInt(disposisiId),
            is_approved: isApproved,
        };

        if (isApproved) {
            if (pilihanJabatan.length === 0) {
                showAlert("Pilih minimal 1 jabatan penerima."); return;
            }
            body.tanggapan_saran = document.getElementById("tanggapanSaran")?.value.trim() || "";
            body.proses_lanjut = document.getElementById("prosesLanjut")?.value.trim() || "";
            body.catatan_kepsek = document.getElementById("catatanTerima")?.value.trim() || "";
            body.koordinasi_konfirmasi = document.getElementById("koordinasiKonfirmasi")?.value.trim() || "";
            body.id_jabatan_penerima = pilihanJabatan.map(p => p.id);
        } else {
            body.catatan_kepsek = document.getElementById("catatanTolak")?.value.trim() || "";
            if (!body.catatan_kepsek) {
                showAlert("Masukkan alasan penolakan."); return;
            }
        }

        btn.disabled = true;
        btn.textContent = "Memproses...";

        try {
            const res = await apiFetch("/disposisi/approve", {
                method: "POST",
                body: JSON.stringify(body)
            });

            if (!res || !res.ok) {
                const data = res ? await res.json() : {};
                showAlert(data.error || "Gagal memproses disposisi.");
                btn.disabled = false;
                btn.textContent = "← Teruskan";
                return;
            }

            localStorage.removeItem("selectedDisposisiId");
            localStorage.removeItem("selectedSuratId");

            if (isApproved) {
                window.location.href = "notifblue.html";
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

    loadDetail();
    loadJabatan();

})();