console.log("auth.js connected");

// SIGNUP
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const email = document.getElementById("email").value;

    if (!email.endsWith("@central.edu.gh")) {
      alert("You must use your Central University email address (@central.edu.gh) to sign up.");
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
        alert("Account created! Please login.");
        window.location.href = "login.html";
      } else {
        alert(data.error);
      }

    } catch (err) {
      console.error(err);
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
        localStorage.setItem("isAdmin", data.isAdmin); // ← added isAdmin
        alert(`Welcome back, ${data.name}!`);
        window.location.href = "index.html";
      } else {
        alert(data.error);
      }

    } catch (err) {
      console.error(err);
    }
  });
}
