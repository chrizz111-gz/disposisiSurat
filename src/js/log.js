const logContainer = document.getElementById('logContainer');
const searchInput = document.getElementById('searchInput');

/* =========================
   DATA LOGIN
========================= */

const logs = [
    {
        tanggal: "28 Mei 2025",
        jam: "10.20",
        pengguna: "Tata Usaha",
        aktivitas: "Login ke sistem",
        foto: "../assets/profil.png"
    },

    {
        tanggal: "27 Mei 2025",
        jam: "09.15",
        pengguna: "Admin",
        aktivitas: "Mengedit Data Surat",
        foto: "../assets/profil.png"
    },

    {
        tanggal: "26 Mei 2025",
        jam: "13.40",
        pengguna: "Kepala Sekolah",
        aktivitas: "Melihat disposisi surat",
        foto: "../assets/profil.png"
    },

    {
        tanggal: "25 Mei 2025",
        jam: "08.55",
        pengguna: "Tata Usaha",
        aktivitas: "Menambah surat masuk",
        foto: "../assets/profil.png"
    },

    {
        tanggal: "24 Mei 2025",
        jam: "11.10",
        pengguna: "Admin",
        aktivitas: "Menghapus data surat",
        foto: "../assets/profil.png"
    }
];

/* =========================
   TAMPILKAN LOG
========================= */

function tampilkanLog(data) {

    logContainer.innerHTML = "";

    data.forEach(log => {

        const row = document.createElement('div');

        row.classList.add('table-row');

        row.innerHTML = `
        
            <div class="time">
                <p>📅 ${log.tanggal}</p>
                <span>${log.jam}</span>
            </div>

            <div class="user">
                <img src="${log.foto}" class="user-photo">
                ${log.pengguna}
            </div>

            <div class="activity">
                ${log.aktivitas}
            </div>

        `;

        logContainer.appendChild(row);

    });

}

/* tampilkan pertama */
tampilkanLog(logs);

/* =========================
   SEARCH TANGGAL
========================= */

searchInput.addEventListener('keyup', () => {

    const keyword = searchInput.value.toLowerCase();

    const hasil = logs.filter(log => 
        log.tanggal.toLowerCase().includes(keyword)
    );

    tampilkanLog(hasil);

});