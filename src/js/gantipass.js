const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');

const bars = document.querySelectorAll('.bar');
const text = document.getElementById('statusText');
const matchText = document.getElementById('matchText');

/* =========================
   VALIDASI RULE PASSWORD
========================= */
function validasiPassword(value) {

    const regex = /^[a-zA-Z0-9]+$/;

    // minimal 8 karakter
    if (value.length < 8) {
        return "Password minimal 8 karakter";
    }

    // tidak boleh simbol
    if (!regex.test(value)) {
        return "Password tidak boleh mengandung simbol";
    }

    // hitung jumlah angka
    const jumlahAngka = (value.match(/[0-9]/g) || []).length;

    // minimal 2 angka
    if (jumlahAngka < 2) {
        return "Password harus mengandung minimal 2 angka";
    }

    return "valid";
}

/* =========================
   PASSWORD STRENGTH
========================= */
password.addEventListener('input', function () {

    const value = password.value;

    // RESET BAR
    bars.forEach(bar => {
        bar.style.background = '#ddd';
        bar.style.transform = 'scaleX(0.3)';
    });

    // VALIDASI
    const valid = validasiPassword(value);

    // kalau tidak valid
    if (valid !== "valid") {

        text.textContent = valid;
        text.style.color = "red";

        return;
    }

    // FULL BAR jika valid
    bars.forEach(bar => {
        bar.style.background = '#00c853';
        bar.style.transform = 'scaleX(1)';
    });

    text.textContent = "✔ Kata sandi valid";
    text.style.color = "#00c853";

    checkMatch();

});

/* =========================
   VALIDASI KONFIRMASI PASSWORD
========================= */
function checkMatch() {

    if (confirmPassword.value === "") {
        matchText.textContent = "";
        return;
    }

    if (password.value === confirmPassword.value) {

        matchText.textContent = "✔ Kata sandi cocok";
        matchText.style.color = "green";

    } else {

        matchText.textContent = "✖ Kata sandi tidak cocok";
        matchText.style.color = "red";

    }

}

confirmPassword.addEventListener('input', checkMatch);

/* =========================
   SHOW / HIDE PASSWORD 👁️
========================= */
const toggles = document.querySelectorAll('.toggle-password');

toggles.forEach(toggle => {

    toggle.addEventListener('click', function () {

        const input = this.parentElement.querySelector('input');

        if (input.type === "password") {

            input.type = "text";

        } else {

            input.type = "password";

        }

    });

});