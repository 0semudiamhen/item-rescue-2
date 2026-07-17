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
        notify("Temporary password sent! Check your email.", "success");
        setTimeout(() => {
          window.location.href = "change-password.html";
        }, 1000);
      } else {
        notify(data.error, "error");
      }

    } catch (err) {
      console.error(err);
      notify("Something went wrong. Please try again.", "error");
    }
  });
}

// CHANGE PASSWORD
const changeForm = document.getElementById("changeForm");

if (changeForm) {
  const token = localStorage.getItem("token");
  const subtitle = document.getElementById("formSubtitle");
  const emailInput = document.getElementById("email");
  const oldPasswordLabel = document.getElementById("oldPassword");

  // If user is already logged in, auto-fill email and adjust wording
  if (token) {
    fetch("http://localhost:8000/api/auth/me", {
      headers: { "Authorization": token }
    })
      .then(res => res.json())
      .then(user => {
        if (user.email) {
          emailInput.value = user.email;
          emailInput.readOnly = true;
          emailInput.style.opacity = "0.6";
        }
        if (subtitle) subtitle.textContent = "Enter your current password and choose a new one";
        if (oldPasswordLabel) oldPasswordLabel.placeholder = "Current password";
      })
      .catch(() => {});
  } else {
    if (subtitle) subtitle.textContent = "Enter your temporary password and choose a new one";
    if (oldPasswordLabel) oldPasswordLabel.placeholder = "Temporary password";
  }

  changeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword = document.getElementById("confirmNewPassword").value;

    if (newPassword !== confirmNewPassword) {
      notify("New passwords do not match!", "error");
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
        notify("Password changed successfully!", "success");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1000);
      } else {
        notify(data.error, "error");
      }

    } catch (err) {
      console.error(err);
      notify("Something went wrong. Please try again.", "error");
    }
  });
}