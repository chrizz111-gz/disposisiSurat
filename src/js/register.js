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
    const gmailFormat = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

    if (username === "" || email === "" || password === "" || confirmpass === "") {
        alert("Semua field harus diisi!");
        return;
    }

    if (password !== confirmpass) {
        alert("Password dan Confirm Password tidak sama!");
        return;
    }
    
    if (!gmailFormat.test(email)) {
        alert("Format email tidak valid!");
        return;
    }


    // Jika valid → pindah ke home
    window.location.href = "home.html";
};
