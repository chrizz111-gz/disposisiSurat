function togglePassword(id, icon) {
    const input = document.getElementById(id);

       if (input.type === "password") {
        input.type = "text";
        icon.src = "../assets/eye-off.png"; // ikon ketika password terlihat
    } else {
        input.type = "password";
        icon.src = "../assets/eye.png"; // ikon ketika password disembunyikan
    }
}
document.getElementById("btnLogin").onclick = function () {

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (email === "" || password === "") {
        alert("Tolong isi email dan password terlebih dahulu.");
        return; // stop supaya tidak pindah halaman
        }

    // Jika tidak kosong → pindah halaman
    window.location.href = "home.html";
};
