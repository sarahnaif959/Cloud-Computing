function toggleDropdown() {
    const dropdown = document.getElementById("notificationDropdown");
    dropdown.classList.toggle("show");
  }
  
  window.addEventListener("click", function (e) {
    const dropdown = document.getElementById("notificationDropdown");
    const icon = document.querySelector(".notification-icon");
    if (!dropdown.contains(e.target) && !icon.contains(e.target)) {
      dropdown.classList.remove("show");
    }
  });
  