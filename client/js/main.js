document.addEventListener("DOMContentLoaded", () => {

  // Protect page
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
  }

  // Show username
  const name = localStorage.getItem("name");
  const welcomeMsg = document.getElementById("welcomeMsg");

  if (name && welcomeMsg) {
    welcomeMsg.textContent = `Welcome, ${name}`;
  }

  // Show admin link if user is admin and not already on admin page
  const isAdmin = localStorage.getItem("isAdmin");
  const onAdminPage = window.location.pathname.includes("admin");

  if (onAdminPage && isAdmin !== "true") {
    window.location.href = "index.html";
    return;
  }

  if (isAdmin === "true" && !onAdminPage) {
    const navRight = document.querySelector(".nav-right");
    if (navRight) {
      const adminLink = document.createElement("a");
      adminLink.href = "admin.html";
      adminLink.textContent = "Admin Panel";
      navRight.insertBefore(adminLink, navRight.firstChild);
    }
  }

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("name");
      localStorage.removeItem("isAdmin");
      window.location.href = "login.html";
    });
  }

});
