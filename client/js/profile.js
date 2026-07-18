const token = localStorage.getItem("token") || sessionStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}

function getInitials(name) {
  return String(name || "CU")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join("");
}

fetch("http://localhost:8000/api/auth/me", {
  headers: {
    "Authorization": token
  }
})
  .then(res => res.json())
  .then(user => {
    if (user.error) {
      notify(user.error, "error");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 700);
      return;
    }

    document.getElementById("profileInitials").textContent = getInitials(user.name);
    document.getElementById("profileName").textContent = user.name || "N/A";
    document.getElementById("profileEmail").textContent = user.email || "N/A";
    document.getElementById("profileIndexNumber").textContent = user.indexNumber || "N/A";
    document.getElementById("profileLoginId").textContent = user.indexNumberNormalized || "N/A";
    document.getElementById("profileDepartment").textContent = user.department || "N/A";
    document.getElementById("profileSchool") && 
    (document.getElementById("profileSchool").textContent = user.school || "N/A");
    document.getElementById("profileLevel").textContent = user.level || "N/A";
    document.getElementById("profileRole").textContent = user.isAdmin ? "Admin" : "Student";
    document.getElementById("profileJoined").textContent = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : "N/A";
  })
  .catch(err => {
    console.error(err);
    notify("Unable to load profile right now.", "error");
  });
