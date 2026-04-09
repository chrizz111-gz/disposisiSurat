// Fungsi Show/Hide Password
function togglePassword(id, icon) {
    const input = document.getElementById(id);

    if (input.type === "password") {
        input.type = "text";
        icon.src = "../assets/eye-off.png";
    } else {
        input.type = "password";
        icon.src = "../assets/eye.png";
    }
}

document.getElementById("register").onclick = function () {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmpass = document.getElementById("confirmpass").value.trim();
    const jabatan = document.getElementById("jabatan").value;

    // Cek input kosong
    if (username === "" || email === "" || password === "" || confirmpass === "" || jabatan === "") {
        alert("Semua kolom wajib diisi!");
        return;
    }

    // Validasi email harus format @gmail.com
    const emailRegex = /^[a-zA-Z0-9._-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
        alert("Email harus menggunakan format example@gmail.com !");
        return;
    }

    // Cek jika password tidak sama
    if (password !== confirmpass) {
        alert("Password dan Confirm Password tidak sama!");
        return;
    }

    // Jika semua benar → pindah ke halaman login
    alert("Pendaftaran berhasil!");
    window.location.href = "login.html";
};
