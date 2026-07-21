let pendingResetEmail = "";

// FORGOT PASSWORD — Step 1: send OTP
const forgotForm = document.getElementById("forgotForm");
const resetSection = document.getElementById("resetSection");

if (forgotForm) {
  forgotForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("forgotEmail").value.trim();

    try {
      const res = await fetch("http://localhost:8000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        pendingResetEmail = email;
        forgotForm.style.display = "none";
        if (resetSection) resetSection.style.display = "block";
        const subtitle = document.getElementById("forgotSubtitle");
        if (subtitle) subtitle.textContent = `Code sent to ${email}`;
        notify("Verification code sent! Check your school email.", "success");
      } else {
        notify(data.error, "error");
      }

    } catch (err) {
      console.error(err);
      notify("Something went wrong. Please try again.", "error");
    }
  });
}

// FORGOT PASSWORD — Step 2: verify OTP and set new password
const resetForm = document.getElementById("resetForm");

if (resetForm) {
  resetForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const otp = document.getElementById("resetOtp").value.trim();
    const newPassword = document.getElementById("resetNewPassword").value;
    const confirmPassword = document.getElementById("resetConfirmPassword").value;

    if (newPassword !== confirmPassword) {
      notify("Passwords do not match.", "error");
      return;
    }

    if (otp.length !== 6) {
      notify("Please enter the 6-digit code.", "error");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingResetEmail, otp, newPassword })
      });

      const data = await res.json();

      if (res.ok) {
        notify("Password reset successfully! Please login.", "success");
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

// Resend reset OTP
const resendResetBtn = document.getElementById("resendResetOtp");
if (resendResetBtn) {
  resendResetBtn.addEventListener("click", async () => {
    if (!pendingResetEmail) return;

    try {
      const res = await fetch("http://localhost:8000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingResetEmail })
      });

      const data = await res.json();
      if (res.ok) {
        notify("New verification code sent.", "success");
      } else {
        notify(data.error, "error");
      }
    } catch (err) {
      notify("Unable to resend code right now.", "error");
    }
  });
}

// CHANGE PASSWORD — OTP flow for logged in users
const requestOtpBtn = document.getElementById("requestOtpBtn");
const changeOtpSection = document.getElementById("changeOtpSection");
const requestOtpSection = document.getElementById("requestOtpSection");
let changePasswordEmail = "";

if (requestOtpBtn) {
  // Get logged in user's email first
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    window.location.href = "login.html";
  }

  // Fetch email from profile
  fetch("http://localhost:8000/api/auth/me", {
    headers: { "Authorization": token }
  })
    .then(res => res.json())
    .then(user => {
      changePasswordEmail = user.email;
      const subtitle = document.getElementById("changeSubtitle");
      if (subtitle) subtitle.textContent = `We'll send a code to ${user.email}`;
    })
    .catch(() => {});

  requestOtpBtn.addEventListener("click", async () => {
    if (!changePasswordEmail) {
      notify("Could not find your email. Please try again.", "error");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: changePasswordEmail })
      });

      const data = await res.json();

      if (res.ok) {
        requestOtpSection.style.display = "none";
        changeOtpSection.style.display = "block";
        notify("Verification code sent to your school email.", "success");
      } else {
        notify(data.error, "error");
      }

    } catch (err) {
      console.error(err);
      notify("Something went wrong. Please try again.", "error");
    }
  });
}

// Change password form — verify OTP and set new password
const changeForm = document.getElementById("changeForm");

if (changeForm) {
  changeForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const otp = document.getElementById("changeOtp").value.trim();
    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword = document.getElementById("confirmNewPassword").value;

    if (newPassword !== confirmNewPassword) {
      notify("Passwords do not match.", "error");
      return;
    }

    if (otp.length !== 6) {
      notify("Please enter the 6-digit code.", "error");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: changePasswordEmail, otp, newPassword })
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

// Resend change password OTP
const resendChangeBtn = document.getElementById("resendChangeOtp");
if (resendChangeBtn) {
  resendChangeBtn.addEventListener("click", async () => {
    if (!changePasswordEmail) return;

    try {
      const res = await fetch("http://localhost:8000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: changePasswordEmail })
      });

      const data = await res.json();
      if (res.ok) {
        notify("New verification code sent.", "success");
      } else {
        notify(data.error, "error");
      }
    } catch (err) {
      notify("Unable to resend code right now.", "error");
    }
  });
}