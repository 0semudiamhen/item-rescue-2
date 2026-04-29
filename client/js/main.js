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

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("name");
      window.location.href = "login.html";
    });
  }

});