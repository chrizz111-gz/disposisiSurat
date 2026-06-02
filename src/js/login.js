// =============================================
// login.js — Fix role routing
// Taruh di: src/js/login.js
// =============================================

const email = document.getElementById("email");
const password = document.getElementById("password");
const btnLogin = document.getElementById("btnLogin");
const togglePw = document.getElementById("togglePw");

let redirectUrl = "";

// ─── Alert ───
function showAlert(message, url = "") {
    document.getElementById("alertMessage").innerText = message;
    document.getElementById("customAlert").style.display = "flex";
    redirectUrl = url;
}

function closeAlert() {
    document.getElementById("customAlert").style.display = "none";
    if (redirectUrl) window.location.href = redirectUrl;
}

// ─── Toggle password ───
togglePw.addEventListener("click", () => {
    if (password.type === "password") {
        password.type = "text";
        togglePw.style.backgroundImage = "url('../assets/eye-off.png')";
    } else {
        password.type = "password";
        togglePw.style.backgroundImage = "url('../assets/eye.png')";
    }
});

// ─── Login ───
btnLogin.addEventListener("click", async () => {
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();

    if (!emailValue || !passwordValue) {
        showAlert("Tolong isi email dan password.");
        return;
    }

    // Backend tidak batasi hanya @gmail.com, jadi pakai validasi umum
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailValue)) {
        showAlert("Format email tidak valid.");
        return;
    }

    try {
        const res = await fetch("http://localhost:7000/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailValue, password: passwordValue })
        });

        const data = await res.json();

        if (!res.ok) {
            showAlert(data.error || "Login gagal");
            return;
        }

        // Simpan session
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        const jabatans = data.user.jabatans || [];

        // ─── Routing per role ───
        const jabatanAktif = jabatans[0];
        localStorage.setItem("activeJabatan", jabatanAktif);

        const j = jabatanAktif.toLowerCase();
        let url = "home_user.html"; // default

        if (j === "kepala sekolah") {
            url = "homeKepsek.html";
        } else if (j === "admin" || j === "pegawai") {
            url = "home.html";
        } else if (j.startsWith("waka")) {
            url = "homeWaka.html";
        }

        showAlert("Login berhasil!", url);

    } catch (error) {
        console.error(error);
        showAlert("Server tidak bisa diakses.");
    }
});