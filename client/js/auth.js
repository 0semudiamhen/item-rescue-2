console.log("auth.js connected");

// SIGNUP
const signupForm = document.getElementById("signupForm");

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
      email: document.getElementById("email").value,
      indexNumber: document.getElementById("indexNumber").value,
      department: document.getElementById("department").value,
      level: document.getElementById("level").value,
      password: document.getElementById("password").value
    };

    try {
      const res = await fetch("http://localhost:8000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user)
      });

      const data = await res.json();

      if (res.ok) {
        notify("Account created. Please login.", "success");
        setTimeout(() => {
          window.location.href = "login.html";
        }, 700);
      } else {
        notify(data.error, "error");
      }

    } catch (err) {
      console.error(err);
      notify("Unable to create account right now.", "error");
    }
  });
}

// LOGIN
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

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
        localStorage.setItem("token", data.token);
        localStorage.setItem("name", data.name);
        localStorage.setItem("isAdmin", data.isAdmin);
        localStorage.setItem("email", data.email);       // ← save email
        localStorage.setItem("role", data.role || "student"); // ← save role
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