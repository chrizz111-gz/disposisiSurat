const sidebar = document.getElementById("sidebar");
const btn = document.getElementById("toggleSidebar");

btn.addEventListener("click", () => {
    sidebar.classList.toggle("hidden");

    // Ubah model tombol
    if (sidebar.classList.contains("hidden")) {
        btn.classList.remove("open");
        btn.classList.add("closed");
        btn.innerText = "III";
    } else {
        btn.classList.remove("closed");
        btn.classList.add("open");
        btn.innerHTML = "<span></span>";
    }
});
