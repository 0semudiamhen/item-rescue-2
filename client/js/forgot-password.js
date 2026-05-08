// FORGOT PASSWORD
const forgotForm = document.getElementById("forgotForm");

if (forgotForm) {
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;

    try {
      const res = await fetch("http://localhost:8000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Temporary password sent! Check your email.");
        window.location.href = "change-password.html";
      } else {
        alert(data.error);
      }

    } catch (err) {
      console.error(err);
    }
  });
}

// CHANGE PASSWORD
const changeForm = document.getElementById("changeForm");

if (changeForm) {
  changeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword = document.getElementById("confirmNewPassword").value;

    if (newPassword !== confirmNewPassword) {
      alert("New passwords do not match!");
      return;
    }

    const credentials = {
      email: document.getElementById("email").value,
      oldPassword: document.getElementById("oldPassword").value,
      newPassword: newPassword
    };

    try {
      const res = await fetch("http://localhost:8000/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
      });

      const data = await res.json();

      if (res.ok) {
        alert("Password changed successfully! Please login.");
        window.location.href = "login.html";
      } else {
        alert(data.error);
      }

    } catch (err) {
      console.error(err);
    }
  });
}