const token = localStorage.getItem("token") || sessionStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}

let allAdminItems = [];
let allAdminUsers = [];

// STATS
const statTotalUsers = document.getElementById("statTotalUsers");
if (statTotalUsers) {
  fetch("http://localhost:8000/api/admin/stats", {
    headers: { "Authorization": token }
  })
    .then(res => res.json())
    .then(data => {
      document.getElementById("statTotalUsers").textContent = data.totalUsers ?? "—";
      document.getElementById("statTotalItems").textContent = data.totalItems ?? "—";
      document.getElementById("statActiveItems").textContent = data.activeItems ?? "—";
      document.getElementById("statResolvedItems").textContent = data.resolvedItems ?? "—";
      document.getElementById("statLostItems").textContent = data.lostItems ?? "—";
      document.getElementById("statFoundItems").textContent = data.foundItems ?? "—";
    })
    .catch(err => console.error(err));
}

// ITEMS
const adminItemsContainer = document.getElementById("adminItemsList");

function renderAdminItems(items) {
  const container = adminItemsContainer;
  if (!container) return;
  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = `<p class="empty-state">No items found.</p>`;
    return;
  }

  items.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("item-card");

    const studentServicesBanner = item.takenToStudentServices
      ? `<p class="student-services-badge">📦 Handed to Student Services</p>`
      : "";

    const statusBadge = item.status === "resolved"
      ? `<span class="badge found">Resolved</span>`
      : `<span class="badge lost">Active</span>`;

    const resolveBtn = item.status === "active" || !item.status
      ? `<button class="resolve-btn" onclick="resolveItem('${item._id}')">Mark as Resolved</button>`
      : `<p style="color: green; font-weight: 700;">✅ Resolved</p>`;

    div.innerHTML = `
      ${item.image ? `<img src="${item.image}" class="item-card-image">` : ""}
      <h3>${item.title}</h3>
      <span class="badge ${item.type}">${item.type}</span>
      ${statusBadge}
      ${studentServicesBanner}
      <p><span>Category:</span> ${item.category || "N/A"}</p>
      <p><span>Location:</span> ${item.location || "N/A"}</p>
      <p><span>Date:</span> ${item.dateOccurred ? new Date(item.dateOccurred).toLocaleDateString() : "N/A"}</p>
      <p><span>Description:</span> ${item.description}</p>
      <p><span>Posted By:</span> ${item.postedBy ? item.postedBy.name : "Unknown"} (${item.postedBy ? item.postedBy.email : "N/A"})</p>
      <div class="btn-group">
        ${resolveBtn}
        <button class="delete-btn" onclick="deleteItem('${item._id}')">Delete Item</button>
      </div>
    `;
    container.appendChild(div);
  });
}

if (adminItemsContainer) {
  fetch("http://localhost:8000/api/admin/items", {
    headers: { "Authorization": token }
  })
    .then(res => res.json())
    .then(data => {
      allAdminItems = data;
      renderAdminItems(allAdminItems);

      const searchInput = document.getElementById("adminItemSearch");
      const filterSelect = document.getElementById("adminItemFilter");

      function applyItemFilters() {
        const term = searchInput ? searchInput.value.toLowerCase() : "";
        const filter = filterSelect ? filterSelect.value : "all";

        const filtered = allAdminItems.filter(item => {
          const matchesSearch =
            item.title.toLowerCase().includes(term) ||
            (item.category && item.category.toLowerCase().includes(term)) ||
            (item.postedBy && item.postedBy.name && item.postedBy.name.toLowerCase().includes(term));

          const matchesFilter =
            filter === "all" ||
            (filter === "active" && (item.status === "active" || !item.status)) ||
            (filter === "resolved" && item.status === "resolved") ||
            (filter === "lost" && item.type === "lost") ||
            (filter === "found" && item.type === "found");

          return matchesSearch && matchesFilter;
        });

        renderAdminItems(filtered);
      }

      if (searchInput) searchInput.addEventListener("input", applyItemFilters);
      if (filterSelect) filterSelect.addEventListener("change", applyItemFilters);
    })
    .catch(err => console.error(err));
}

// USERS
const adminUsersContainer = document.getElementById("adminUsersList");

function renderAdminUsers(users) {
  const container = adminUsersContainer;
  if (!container) return;
  container.innerHTML = "";

  if (users.length === 0) {
    container.innerHTML = `<p class="empty-state">No users found.</p>`;
    return;
  }

  users.forEach(user => {
    const div = document.createElement("div");
    div.classList.add("item-card");

    div.innerHTML = `
      <h3>${user.name}</h3>
      <p><span>Email:</span> ${user.email}</p>
      <p><span>Index Number:</span> ${user.indexNumber || "N/A"}</p>
      <p><span>Login ID:</span> ${user.indexNumberNormalized || "N/A"}</p>
      <p><span>School / Faculty:</span> ${user.school || "N/A"}</p>
      <p><span>Department:</span> ${user.department || "N/A"}</p>
      <p><span>Level:</span> ${user.level || "N/A"}</p>
      <p><span>Role:</span> ${user.isAdmin ? "Admin" : "Student"}</p>
      <p><span>Joined:</span> ${new Date(user.createdAt).toLocaleDateString()}</p>
      <br>
      <button class="delete-btn" onclick="deleteUser('${user._id}')">Delete User</button>
    `;
    container.appendChild(div);
  });
}

if (adminUsersContainer) {
  fetch("http://localhost:8000/api/admin/users", {
    headers: { "Authorization": token }
  })
    .then(res => res.json())
    .then(data => {
      allAdminUsers = data;
      renderAdminUsers(allAdminUsers);

      const searchInput = document.getElementById("adminUserSearch");
      const filterSelect = document.getElementById("adminUserFilter");

      function applyUserFilters() {
        const term = searchInput ? searchInput.value.toLowerCase() : "";
        const filter = filterSelect ? filterSelect.value : "all";

        const filtered = allAdminUsers.filter(user => {
          const matchesSearch =
            user.name.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            (user.indexNumber && user.indexNumber.toLowerCase().includes(term));

          const matchesFilter =
            filter === "all" ||
            (filter === "admin" && user.isAdmin) ||
            (filter === "student" && !user.isAdmin);

          return matchesSearch && matchesFilter;
        });

        renderAdminUsers(filtered);
      }

      if (searchInput) searchInput.addEventListener("input", applyUserFilters);
      if (filterSelect) filterSelect.addEventListener("change", applyUserFilters);
    })
    .catch(err => console.error(err));
}

// Mark item as resolved (admin)
async function resolveItem(id) {
  if (!confirm("Mark this item as resolved? It will be removed from the main listing.")) return;

  try {
    const res = await fetch(`http://localhost:8000/api/items/${id}/resolve`, {
      method: "PATCH",
      headers: { "Authorization": token }
    });

    const data = await res.json();

    if (res.ok) {
      notify("Item marked as resolved.", "success");
      setTimeout(() => window.location.reload(), 600);
    } else {
      notify(data.error, "error");
    }
  } catch (err) {
    console.error(err);
    notify("Unable to resolve item right now.", "error");
  }
}

// Delete item
async function deleteItem(id) {
  if (!confirm("Are you sure you want to delete this item?")) return;

  try {
    const res = await fetch(`http://localhost:8000/api/admin/items/${id}`, {
      method: "DELETE",
      headers: { "Authorization": token }
    });

    const data = await res.json();

    if (res.ok) {
      notify("Item deleted successfully.", "success");
      setTimeout(() => window.location.reload(), 600);
    } else {
      notify(data.error, "error");
    }
  } catch (err) {
    console.error(err);
    notify("Unable to delete item right now.", "error");
  }
}

// Delete user
async function deleteUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    const res = await fetch(`http://localhost:8000/api/admin/users/${id}`, {
      method: "DELETE",
      headers: { "Authorization": token }
    });

    const data = await res.json();

    if (res.ok) {
      notify("User deleted successfully.", "success");
      setTimeout(() => window.location.reload(), 600);
    } else {
      notify(data.error, "error");
    }
  } catch (err) {
    console.error(err);
    notify("Unable to delete user right now.", "error");
  }
}