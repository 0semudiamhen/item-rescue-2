console.log("auth.js connected");

function saveSession(data, remember) {
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem("token", data.token);
  storage.setItem("name", data.name);
  storage.setItem("isAdmin", data.isAdmin);
  storage.setItem("email", data.email);
  storage.setItem("role", data.role || "student");
}

// SIGNUP
const signupForm = document.getElementById("signupForm");
const otpSection = document.getElementById("otpSection");
const otpForm = document.getElementById("otpForm");
let pendingEmail = "";

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      notify("Passwords do not match.", "error");
      return;
    }

    const email = document.getElementById("email").value;

    if (!email.endsWith("@central.edu.gh")) {
      notify("Use your Central University email address.", "error");
      return;
    }

    const user = {
      name: document.getElementById("name").value,
      email,
      indexNumber: document.getElementById("indexNumber").value,
      school: document.getElementById("school").value,
      department: document.getElementById("department").value,
      level: document.getElementById("level").value,
      password
    };

    try {
      const res = await fetch("http://localhost:8000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
      });

      const data = await res.json();

      if (res.ok) {
        if (data.token) {
          // OTP skipped — account created directly
          saveSession(data, true);
          notify(`Welcome to CU Item Rescue, ${data.name}!`, "success");
          setTimeout(() => {
            window.location.href = "how-to.html";
          }, 700);
        } else {
          // OTP required — show OTP section
          pendingEmail = email;
          signupForm.style.display = "none";
          if (otpSection) otpSection.style.display = "block";
          notify(`Verification code sent to ${email}`, "success");
        }
      } else {
        notify(data.error, "error");
      }

    } catch (err) {
      console.error(err);
      notify("Unable to send verification code right now.", "error");
    }
  });
}

// OTP VERIFICATION
if (otpForm) {
  otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const otp = document.getElementById("otpInput").value.trim();

    if (!otp || otp.length !== 6) {
      notify("Please enter the 6-digit code.", "error");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, otp })
      });

      const data = await res.json();

      if (res.ok) {
        saveSession(data, true);
        notify(`Welcome to CU Item Rescue, ${data.name}!`, "success");
        setTimeout(() => {
          window.location.href = "how-to.html";
        }, 700);
      } else {
        notify(data.error, "error");
      }

    } catch (err) {
      console.error(err);
      notify("Unable to verify code right now.", "error");
    }
  });
}

// Resend OTP
const resendBtn = document.getElementById("resendOtp");
if (resendBtn) {
  resendBtn.addEventListener("click", async () => {
    if (!pendingEmail) return;

    try {
      const res = await fetch("http://localhost:8000/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pendingEmail, resend: true })
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

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const rememberMe = document.getElementById("rememberMe").checked;

    const credentials = {
      email: document.getElementById("email").value.trim(),
      password: document.getElementById("password").value
    };

    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
      });

      const data = await res.json();

      if (res.ok) {
        saveSession(data, rememberMe);
        notify(`Welcome back, ${data.name}.`, "success");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 500);
      } else {
        notify(data.error, "error");
      }

    } catch (err) {
      console.error(err);
      notify("Unable to login right now.", "error");
    }
  });
}