const emailInput = document.getElementById('email');
const verifyBtn = document.querySelector('.verify-btn');

emailInput.addEventListener('input', () => {

    const value = emailInput.value;

    // cek email valid
    if (!value.includes('@')) {

        // tombol tidak bisa ditekan
        verifyBtn.disabled = true;
        verifyBtn.style.opacity = "0.5";
        verifyBtn.style.cursor = "not-allowed";

    }

    else {

        // tombol aktif kembali
        verifyBtn.disabled = false;
        verifyBtn.style.opacity = "1";
        verifyBtn.style.cursor = "pointer";

    }

});