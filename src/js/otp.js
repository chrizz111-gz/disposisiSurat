const inputs = document.querySelectorAll('.otp-input');
const timerElement = document.querySelector('.timer');
const resendBtn = document.querySelector('.resend');

/* =========================
   TIMER OTP
========================= */

let resendCount = parseInt(localStorage.getItem('resendCount')) || 0;
let maxResend = 5;
let timerInterval;

// ambil waktu selesai dari localStorage
let endTime = localStorage.getItem('otpEndTime');

// kalau belum ada, buat baru
if (!endTime) {

    endTime = Date.now() + 120000; // 2 menit
    localStorage.setItem('otpEndTime', endTime);

}

function updateTimer() {

    // hitung sisa waktu
    let remaining = Math.floor((endTime - Date.now()) / 1000);

    // jika negatif
    if (remaining < 0) {
        remaining = 0;
    }

    let minutes = Math.floor(remaining / 60);
    let seconds = remaining % 60;

    // format 2 digit
    minutes = String(minutes).padStart(2, '0');
    seconds = String(seconds).padStart(2, '0');

    timerElement.innerHTML = `⏲ Kode berlaku ${minutes}:${seconds}`;

    // timer masih berjalan
    if (remaining > 0) {

        resendBtn.style.opacity = "0.5";
        resendBtn.style.cursor = "not-allowed";

    }

    // timer habis
    else {

        clearInterval(timerInterval);

        // resend masih tersedia
        if (resendCount < maxResend) {

            resendBtn.style.opacity = "1";
            resendBtn.style.cursor = "pointer";

        }

        // resend habis
        else {

            resendBtn.textContent = "Batas resend habis";
            resendBtn.style.opacity = "0.5";
            resendBtn.style.cursor = "not-allowed";

        }

    }

}

// mulai timer
timerInterval = setInterval(updateTimer, 1000);

updateTimer();

/* =========================
   RESEND OTP
========================= */

resendBtn.addEventListener('click', () => {

    let remaining = Math.floor((endTime - Date.now()) / 1000);

    // hanya bisa jika timer habis
    if (remaining <= 0 && resendCount < maxResend) {

        resendCount++;

        // simpan jumlah resend
        localStorage.setItem('resendCount', resendCount);

        // reset timer 2 menit
        endTime = Date.now() + 120000;

        localStorage.setItem('otpEndTime', endTime);

        updateTimer();

        timerInterval = setInterval(updateTimer, 1000);

    }

});

/* =========================
   OTP INPUT
========================= */

// fokus pertama
inputs[0].focus();

inputs.forEach((input, index) => {

    // saat mengetik
    input.addEventListener('input', () => {

        // hanya angka
        input.value = input.value.replace(/[^0-9]/g, '');

        // hanya 1 karakter
        input.value = input.value.slice(0, 1);

        // pindah otomatis
        if (input.value !== '') {

            if (index < inputs.length - 1) {
                inputs[index + 1].focus();
            }

        }

    });

    // backspace kembali
    input.addEventListener('keydown', (e) => {

        if (e.key === 'Backspace' && input.value === '') {

            if (index > 0) {
                inputs[index - 1].focus();
            }

        }

    });

    // cegah klik manual jika sebelumnya kosong
    input.addEventListener('click', () => {

        for (let i = 0; i < index; i++) {

            if (inputs[i].value === '') {

                inputs[i].focus();
                return;

            }

        }

    });

});