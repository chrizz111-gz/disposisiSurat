let redirectUrl = "";

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

document.getElementById("register").onclick = function () {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmpass = document.getElementById("confirmpass").value.trim();
    const jabatan = document.getElementById("jabatan").value;

    if (username === "" || email === "" || password === "" || confirmpass === "" || jabatan === "") {
        showAlert("Semua kolom wajib diisi!");
        return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@gmail\.com$/;
    if (!emailRegex.test(email)) {
        showAlert("Email harus menggunakan format example@gmail.com!");
        return;
    }

    if (password !== confirmpass) {
        showAlert("Password dan Confirm Password tidak sama!");
        return;
    }

    showAlert("Pendaftaran berhasil!", "login.html");
};