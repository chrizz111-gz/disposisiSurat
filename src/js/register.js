// =============================================
// register.js — Halaman Tambah Akun (Final)
// =============================================

// Mapping nama → id_jabatan (uint) dari SQL database
const JABATAN_ID_MAP = {
    "bkk": 9,
    "kapro rpl": 11,
    "kapro tkj": 12,
    "kapro dkv": 13,
    "kapro ei": 15,
    "kapro mt": 16,
    "kapro av": 17,
    "kapro bc": 18,
    "waka kesiswaan": 5,
    "waka kurikulum": 6,
    "waka sarpras": 7,
    "waka humas": 8,
    "kapro an": 14,
    "bk": 19,
    "prakerin": 20,
    "koordinator waka": 21,
    "koordinator bk": 22,
    "koordinator bkk": 23
};

// Daftar jabatan untuk dropdown (hanya user + pegawai)
const JABATAN_OPTIONS = Object.entries(JABATAN_ID_MAP).map(([name, id]) => ({
    value: name,
    label: name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    id: id
}));

// =============================================
// TOGGLE PASSWORD VISIBILITY
// =============================================

function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        icon.src = "../assets/eye-off.png";
    } else {
        input.type = "password";
        icon.src = "../assets/eye.png";
    }
}

// =============================================
// JABATAN MANAGEMENT
// =============================================

function addJabatanField(selectedValue = "") {
    const list = document.getElementById('jabatanList');
    const item = document.createElement('div');
    item.className = 'jabatan-item';

    const select = document.createElement('select');
    select.className = 'input';
    select.required = true;
    select.style.cursor = 'pointer';

    // Option default
    const defaultOpt = document.createElement('option');
    defaultOpt.value = "";
    defaultOpt.textContent = "Pilih Jabatan";
    defaultOpt.disabled = true;
    defaultOpt.selected = !selectedValue;
    select.appendChild(defaultOpt);

    // Option jabatan
    JABATAN_OPTIONS.forEach(j => {
        const opt = document.createElement('option');
        opt.value = j.value;
        opt.textContent = j.label;
        if (j.value === selectedValue) opt.selected = true;
        select.appendChild(opt);
    });

    // Tombol hapus
    const btnRemove = document.createElement('button');
    btnRemove.type = 'button';
    btnRemove.className = 'btn-remove-jabatan';
    btnRemove.innerHTML = '×';
    btnRemove.title = 'Hapus jabatan';
    btnRemove.onclick = function () {
        if (list.children.length <= 1) {
            showAlert("Minimal harus memiliki 1 jabatan!");
            return;
        }
        item.remove();
    };

    item.appendChild(select);
    item.appendChild(btnRemove);
    list.appendChild(item);
}

function getSelectedJabatans() {
    const selects = document.querySelectorAll('.jabatan-item select');
    const jabatans = [];

    selects.forEach(select => {
        if (select.value) {
            jabatans.push(JABATAN_ID_MAP[select.value]);
        }
    });

    return jabatans;
}

// =============================================
// VALIDASI FORM
// =============================================

function validateForm() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmpass = document.getElementById('confirmpass').value;
    const jabatans = getSelectedJabatans();
    const errorMsg = document.getElementById('errorMsg');

    errorMsg.textContent = '';

    if (!username) {
        errorMsg.textContent = 'Nama tidak boleh kosong!';
        return false;
    }

    if (!email) {
        errorMsg.textContent = 'Email tidak boleh kosong!';
        return false;
    }

    if (!email.includes('@')) {
        errorMsg.textContent = 'Format email tidak valid!';
        return false;
    }

    if (password.length < 6) {
        errorMsg.textContent = 'Password minimal 6 karakter!';
        return false;
    }

    if (password !== confirmpass) {
        errorMsg.textContent = 'Password dan konfirmasi tidak cocok!';
        return false;
    }

    if (jabatans.length === 0) {
        errorMsg.textContent = 'Pilih minimal 1 jabatan!';
        return false;
    }

    const unique = [...new Set(jabatans)];
    if (unique.length !== jabatans.length) {
        errorMsg.textContent = 'Jabatan tidak boleh duplikat!';
        return false;
    }

    return true;
}

// =============================================
// HANDLE REGISTER
// =============================================

async function handleRegister() {
    if (!validateForm()) return;

    const btn = document.getElementById('registerBtn');
    const btnText = btn.querySelector('.btn-text');
    const btnLoading = btn.querySelector('.btn-loading');

    btn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';

    const jabatans = getSelectedJabatans();

    const payload = {
        name: document.getElementById('username').value.trim(),
        email: document.getElementById('email').value.trim(),
        password: document.getElementById('password').value,
        jabatans: jabatans
    };

    console.log('=== PAYLOAD ===');
    console.log(JSON.stringify(payload, null, 2));
    console.log('===============');

    try {
        const res = await apiCreateUser(
            payload.name,
            payload.email,
            payload.password,
            payload.jabatans
        );

        if (res && res.ok) {
            showAlert('Akun berhasil dibuat!', 'login.html');
        } else {
            let errMsg = 'Gagal mendaftar.';
            try {
                const text = await res.text();
                const errData = JSON.parse(text);
                errMsg = errData?.message || errData?.error || JSON.stringify(errData);
            } catch (e) {
                errMsg = 'Server error ' + res.status;
            }
            showAlert('Error ' + res.status + ': ' + errMsg);
        }
    } catch (err) {
        console.error('Network error:', err);
        showAlert('Server tidak bisa diakses. Coba lagi nanti.');
    } finally {
        btn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
}

// =============================================
// ALERT FUNCTIONS
// =============================================

function showAlert(msg, redirect = '') {
    document.getElementById('alertMessage').innerText = msg;
    document.getElementById('customAlert').style.display = 'flex';

    if (redirect) {
        const btn = document.querySelector('.alert-box button');
        btn.onclick = function () {
            closeAlert();
            window.location.href = redirect;
        };
    }
}

function closeAlert() {
    document.getElementById('customAlert').style.display = 'none';
}

// =============================================
// INIT
// =============================================

document.addEventListener('DOMContentLoaded', function () {
    addJabatanField();
});