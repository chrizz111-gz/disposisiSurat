// Elemen
const email = document.getElementById("email");
const password = document.getElementById("password");
const btnLogin = document.getElementById("btnLogin");
const togglePw = document.getElementById("togglePw");

let redirectUrl = "";

// ================= ALERT CUSTOM =================
function showAlert(message, url = "") {
    document.getElementById("alertMessage").innerText = message;
    document.getElementById("customAlert").style.display = "flex";
    redirectUrl = url;
}

function closeAlert() {
    document.getElementById("customAlert").style.display = "none";

    if (redirectUrl !== "") {
        window.location.href = redirectUrl;
    }
}

// ================= SHOW / HIDE PASSWORD =================
togglePw.addEventListener("click", () => {
    if (password.type === "password") {
        password.type = "text";
        togglePw.style.backgroundImage = "url('../assets/eye-off.png')";
    } else {
        password.type = "password";
        togglePw.style.backgroundImage = "url('../assets/eye.png')";
    }
});

// ================= VALIDASI LOGIN =================
btnLogin.addEventListener("click", () => {

    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();

    // Validasi kosong
    if (emailValue === "" || passwordValue === "") {
        showAlert("Tolong isi email dan password terlebih dahulu.");
        return;
    }

    // Validasi email format
    const emailRegex = /^[a-zA-Z0-9._-]+@gmail\.com$/;

    if (!emailRegex.test(emailValue)) {
        showAlert("Email harus berformat 'example@gmail.com'.");
        return;
    }

    // ================= LOGIN ROLE =================

    // ADMIN
    if (emailValue === "admin@gmail.com" && passwordValue === "admin123") {

        showAlert("Login Admin berhasil!", "home.html");

    }

    // KEPSEK
    else if (emailValue === "kepsek@gmail.com" && passwordValue === "kepsek123") {

        showAlert("Login Kepala Sekolah berhasil!", "homeKepsek.html");

    }

    // USER
    else if (emailValue === "user@gmail.com" && passwordValue === "user123") {

        showAlert("Login User berhasil!", "home_user.html");

    }

    // SALAH
    else {

        showAlert("Email atau password salah!");

    }

});