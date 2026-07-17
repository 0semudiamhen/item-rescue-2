document.addEventListener("DOMContentLoaded", () => {

  // Helper — read from whichever storage has the token
  function getSession(key) {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  }

  function clearSession() {
    ["token", "name", "isAdmin", "email", "role"].forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }

  // Protect page
  const token = getSession("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  // Show username
  const name = getSession("name");
  const welcomeMsg = document.getElementById("welcomeMsg");

  if (name && welcomeMsg) {
    welcomeMsg.textContent = `Welcome, ${name}`;
  }

  // Admin page protection and link injection
  const isAdmin = getSession("isAdmin");
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
      clearSession();
      window.location.href = "login.html";
    });
  }

});