document.addEventListener("DOMContentLoaded", () => {

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

  // Admin page protection
  const isAdmin = getSession("isAdmin");
  const onAdminPage = window.location.pathname.includes("admin");

  if (onAdminPage && isAdmin !== "true") {
    window.location.href = "index.html";
    return;
  }

  // Inject admin link into dropdown if admin
  if (isAdmin === "true") {
    const dropdownMenu = document.querySelector(".nav-dropdown-menu");
    if (dropdownMenu) {
      const adminLink = document.createElement("a");
      adminLink.href = "admin.html";
      adminLink.textContent = "Admin Panel";
      dropdownMenu.appendChild(adminLink);
    }
  }

  // Dropdown — hover for desktop, click for touch
  const dropdowns = document.querySelectorAll(".nav-dropdown");
  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector(".nav-dropdown-trigger");
    const menu = dropdown.querySelector(".nav-dropdown-menu");
    let closeTimer;

    // Hover open
    dropdown.addEventListener("mouseenter", () => {
      clearTimeout(closeTimer);
      menu.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
    });

    // Hover close with delay so cursor can move into menu
    dropdown.addEventListener("mouseleave", () => {
      closeTimer = setTimeout(() => {
        menu.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
      }, 180);
    });

    // Touch/click toggle
    trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.contains("open");
      // Close all other dropdowns first
      document.querySelectorAll(".nav-dropdown-menu").forEach(m => m.classList.remove("open"));
      document.querySelectorAll(".nav-dropdown-trigger").forEach(t => t.setAttribute("aria-expanded", "false"));
      if (!isOpen) {
        menu.classList.add("open");
        trigger.setAttribute("aria-expanded", "true");
      }
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", () => {
    document.querySelectorAll(".nav-dropdown-menu").forEach(m => m.classList.remove("open"));
    document.querySelectorAll(".nav-dropdown-trigger").forEach(t => t.setAttribute("aria-expanded", "false"));
  });

  // Hamburger for mobile
  const hamburger = document.getElementById("navHamburger");
  const navRight = document.getElementById("navRight");

  if (hamburger && navRight) {
    hamburger.addEventListener("click", (e) => {
      e.stopPropagation();
      navRight.classList.toggle("nav-open");
    });

    document.addEventListener("click", (e) => {
      if (!navRight.contains(e.target) && e.target !== hamburger) {
        navRight.classList.remove("nav-open");
      }
    });
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