// Elemen
const email = document.getElementById("email");
const password = document.getElementById("password");
const btnLogin = document.getElementById("btnLogin");
const togglePw = document.getElementById("togglePw");

// Fitur show/hide password
togglePw.addEventListener("click", () => {
    if (password.type === "password") {
        password.type = "text";
        togglePw.style.backgroundImage = "url('../assets/eye-off.png')";
    } else {
        password.type = "password";
        togglePw.style.backgroundImage = "url('../assets/eye.png')";
    }
});

// Validasi input sebelum pindah halaman
btnLogin.addEventListener("click", () => {
    const emailValue = email.value.trim();
    const passwordValue = password.value.trim();

    // Validasi email dan password tidak kosong
    if (emailValue === "" || passwordValue === "") {
        alert("Tolong isi email dan password terlebih dahulu.");
        return; // Stop → tidak berpindah halaman
    }

    // Validasi format email harus mengandung '@gmail.com'
    const emailRegex = /^[a-zA-Z0-9._-]+@gmail\.com$/;
    if (!emailRegex.test(emailValue)) {
        alert("Email harus berformat 'example@gmail.com'.");
        return; // Stop → tidak berpindah halaman
    }

    // Jika semua valid → pindah halaman
    window.location.href = "home.html";
}); 
