const filterStatus = document.getElementById("filterStatus");
const tabs = document.querySelectorAll(".tab");
const rows = document.querySelectorAll("#tableBody tr");

let currentJenis = "semua";

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        currentJenis = tab.dataset.jenis;
        filterTable();
    });
});

filterStatus.addEventListener("change", filterTable);

function filterTable() {
    const selectedStatus = filterStatus.value;

    rows.forEach(row => {
        const rowStatus = row.dataset.status;
        const rowJenis = row.dataset.jenis;

        const cocokStatus =
            selectedStatus === "semua" || rowStatus === selectedStatus;

        const cocokJenis =
            currentJenis === "semua" || rowJenis === currentJenis;

        if (cocokStatus && cocokJenis) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}