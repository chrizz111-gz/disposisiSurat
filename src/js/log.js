// log.js — Riwayat Aktivitas (Dinamis)

let allActivities = [];
let usersList = [];

// Mapping aktivitas untuk badge & label
const AKTIVITAS_MAP = {
    'login': { label: 'Login', class: 'badge-login' },
    'logout': { label: 'Logout', class: 'badge-logout' },
    'create_surat': { label: 'Membuat Surat', class: 'badge-create' },
    'delete_surat': { label: 'Menghapus Surat', class: 'badge-delete' },
    'forward_surat': { label: 'Meneruskan Surat', class: 'badge-forward' },
    'read_surat': { label: 'Membaca Surat', class: 'badge-read' },
    'approve_surat': { label: 'Menyetujui Surat', class: 'badge-approve' },
    'reject_surat': { label: 'Menolak Surat', class: 'badge-reject' },
    'create_user': { label: 'Membuat Akun', class: 'badge-user' },
    'delete_user': { label: 'Menghapus Akun', class: 'badge-user' },
    'update_user': { label: 'Mengubah Akun', class: 'badge-user' }
};

// Format tanggal
function formatTanggal(isoString) {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
}

function formatWaktu(isoString) {
    if (!isoString) return '-';
    const date = new Date(isoString);
    return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Render tabel
function renderTable(data) {
    const tbody = document.getElementById('activityTable');

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="empty-cell">Tidak ada aktivitas ditemukan.</td></tr>';
        return;
    }

    tbody.innerHTML = data.map(item => {
        const aktivitas = AKTIVITAS_MAP[item.aktivitas] || {
            label: item.aktivitas,
            class: 'badge-user'
        };

        const tanggal = formatTanggal(item.created_at || item.tanggal);
        const waktu = formatWaktu(item.created_at || item.tanggal);

        return `
            <tr>
                <td>
                    <div>${tanggal}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">${waktu}</div>
                </td>
                <td>
                    <div class="user-cell">
                        <div class="user-avatar">👤</div>
                        <div>
                            <div style="font-weight: 600;">${item.user_name || item.pengguna || '-'}</div>
                            <div style="font-size: 12px; color: #666;">${item.user_jabatan || ''}</div>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="aktivitas-badge ${aktivitas.class}">
                        ${aktivitas.label}
                    </span>
                </td>
                <td class="detail-cell">${item.detail || '-'}</td>
            </tr>
        `;
    }).join('');
}

// Isi dropdown pengguna
function populateUserFilter(users) {
    const select = document.getElementById('penggunaFilter');

    users.forEach(user => {
        const opt = document.createElement('option');
        opt.value = user.id || user.name;
        opt.textContent = user.name || user;
        select.appendChild(opt);
    });
}

// Filter data
function filterData() {
    const tanggal = document.getElementById('tanggalFilter').value;
    const pengguna = document.getElementById('penggunaFilter').value;
    const aktivitas = document.getElementById('aktivitasFilter').value;

    const filtered = allActivities.filter(item => {
        const itemDate = (item.created_at || item.tanggal || '').split('T')[0];

        const matchTanggal = !tanggal || itemDate === tanggal;
        const matchPengguna = !pengguna ||
            (item.user_id == pengguna) ||
            (item.user_name === pengguna) ||
            (item.pengguna === pengguna);
        const matchAktivitas = !aktivitas || item.aktivitas === aktivitas;

        return matchTanggal && matchPengguna && matchAktivitas;
    });

    renderTable(filtered);
}

// Load data dari API
async function loadActivities() {
    const tbody = document.getElementById('activityTable');
    tbody.innerHTML = '<tr><td colspan="4" class="loading-cell">Memuat data...</td></tr>';

    try {
        // 🔥 Ganti dengan endpoint API yang sesuai
        // Contoh: /logs, /activities, /audit-trail
        const res = await apiFetch('/logs'); // atau endpoint API kamu

        if (!res || !res.ok) {
            // Fallback: gunakan data dummy untuk demo
            console.log('API tidak tersedia, menggunakan data demo');
            useDemoData();
            return;
        }

        const data = await res.json();
        allActivities = data.data || data || [];

        // Extract unique users untuk filter
        const users = [...new Map(allActivities.map(a => [
            a.user_id || a.pengguna,
            { id: a.user_id, name: a.user_name || a.pengguna }
        ])).values()];

        populateUserFilter(users);
        renderTable(allActivities);

    } catch (err) {
        console.error('Error loading activities:', err);
        useDemoData();
    }
}

// Data demo (fallback kalau API tidak tersedia)
function useDemoData() {
    allActivities = [
        {
            created_at: '2025-05-28T07:15:00',
            user_name: 'Pegawai 1',
            user_jabatan: 'Admin',
            aktivitas: 'create_surat',
            detail: 'Membuat surat masuk nomor 001/A dari Dinas Pendidikan.'
        },
        {
            created_at: '2025-05-28T08:13:00',
            user_name: 'Pegawai 2',
            user_jabatan: 'TU',
            aktivitas: 'delete_surat',
            detail: 'Menghapus surat keluar nomor 003/C karena duplikat.'
        },
        {
            created_at: '2025-05-28T08:16:00',
            user_name: 'Admin',
            user_jabatan: 'Admin',
            aktivitas: 'forward_surat',
            detail: 'Meneruskan surat masuk nomor 002/B ke Waka Kurikulum.'
        },
        {
            created_at: '2025-05-28T08:30:00',
            user_name: 'Pegawai 3',
            user_jabatan: 'Waka Humas',
            aktivitas: 'read_surat',
            detail: 'Membaca dan memproses surat masuk nomor 004/D.'
        },
        {
            created_at: '2025-05-28T09:05:00',
            user_name: 'Admin',
            user_jabatan: 'Admin',
            aktivitas: 'delete_user',
            detail: 'Menghapus akun pengguna Roudhothul Husna Yanif.'
        }
    ];

    const users = [...new Map(allActivities.map(a => [
        a.user_name,
        { id: a.user_name, name: a.user_name }
    ])).values()];

    populateUserFilter(users);
    renderTable(allActivities);
}

// Event listeners
document.getElementById('tanggalFilter')?.addEventListener('change', filterData);
document.getElementById('penggunaFilter')?.addEventListener('change', filterData);
document.getElementById('aktivitasFilter')?.addEventListener('change', filterData);

// Init
document.addEventListener('DOMContentLoaded', loadActivities);