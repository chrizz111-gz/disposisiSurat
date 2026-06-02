// usermanage.js — Manajemen Akun

const user = getUser();
if (!user) window.location.href = "login.html";

let allUsers = [];

let redirectUrl = "";
function showAlert(msg, url = "") {
    document.getElementById("alertMessage").innerText = msg;
    document.getElementById("customAlert").style.display = "flex";
    redirectUrl = url;
}
function closeAlert() {
    document.getElementById("customAlert").style.display = "none";
    if (redirectUrl) window.location.href = redirectUrl;
}

function renderCard(u) {
    const jabatanLabel = Array.isArray(u.jabatans)
        ? u.jabatans.map(j => j.charAt(0).toUpperCase() + j.slice(1)).join(", ")
        : "-";

    const card = document.createElement("div");
    card.className = "user-card";
    card.innerHTML = `
        <div class="user-info">
            <div class="user-avatar">👤</div>
            <div>
                <div class="user-name">${u.name || u.nama || "-"}</div>
                <div class="user-role">${jabatanLabel}</div>
            </div>
        </div>
        <div class="user-actions">
            <span class="jabatan-display">${jabatanLabel}</span>
            <button class="btn-hapus" onclick="hapusAkun(${u.id})">
                <span>🗑</span> Hapus
            </button>
        </div>
    `;
    return card;
}

function renderUsers(users) {
    const list = document.getElementById("userList");
    list.innerHTML = "";
    if (users.length === 0) {
        list.innerHTML = '<p class="empty-state">Belum ada akun.</p>';
        return;
    }
    users.forEach(u => list.appendChild(renderCard(u)));
}

async function loadUsers() {
    const list = document.getElementById("userList");
    list.innerHTML = '<p class="loading-text">Memuat data...</p>';

    try {
        const res = await apiFetch("/admin/users");
        if (!res || !res.ok) {
            list.innerHTML = '<p class="empty-state" style="color:#e74c3c">Gagal memuat data.</p>';
            return;
        }
        const data = await res.json();
        allUsers = data.data || [];
        renderUsers(allUsers);
    } catch (err) {
        console.error(err);
        list.innerHTML = '<p class="empty-state" style="color:#e74c3c">Server tidak bisa diakses.</p>';
    }
}

async function hapusAkun(userId) {
    if (!confirm("Yakin ingin menghapus akun ini?")) return;
    try {
        const res = await apiFetch("/admin/users/" + userId, { method: "DELETE" });
        if (res?.ok) {
            showAlert("Akun berhasil dihapus.");
            loadUsers();
        } else {
            showAlert("Gagal menghapus akun.");
        }
    } catch (err) {
        showAlert("Server tidak bisa diakses.");
    }
}

document.getElementById("searchInput").addEventListener("input", (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = allUsers.filter(u =>
        (u.name || u.nama || "").toLowerCase().includes(keyword) ||
        (u.email || "").toLowerCase().includes(keyword) ||
        (u.jabatans || []).some(j => j.toLowerCase().includes(keyword))
    );
    renderUsers(filtered);
});

loadUsers();