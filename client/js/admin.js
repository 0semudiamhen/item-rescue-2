const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}

// Fetch all items
fetch("http://localhost:8000/api/admin/items", {
  headers: {
    "Authorization": token
  }
})
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("adminItemsList");
    if (!container) return;

    if (data.length === 0) {
      container.innerHTML = "<p>No items posted yet.</p>";
      return;
    }

    data.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("item-card");

      const studentServicesBanner = item.takenToStudentServices
        ? `<p class="student-services-badge">📦 Handed to Student Services</p>`
        : "";

      // Status badge
      const statusBadge = item.status === "resolved"
        ? `<span class="badge found">Resolved</span>`
        : `<span class="badge lost">Active</span>`;

      // Resolve button (only show if active)
      const resolveBtn = item.status === "active" || !item.status
        ? `<button class="resolve-btn" onclick="resolveItem('${item._id}')">Mark as Resolved</button>`
        : `<p style="color: green; font-weight: 700;">✅ Resolved</p>`;

      div.innerHTML = `
        <h3>${item.title}</h3>
        <span class="badge ${item.type}">${item.type}</span>
        ${statusBadge}
        ${studentServicesBanner}
        <p><span>Category:</span> ${item.category || "N/A"}</p>
        <p><span>Location:</span> ${item.location || "N/A"}</p>
        <p><span>Description:</span> ${item.description}</p>
        <p><span>Posted By:</span> ${item.postedBy ? item.postedBy.name : "Unknown"} (${item.postedBy ? item.postedBy.email : "N/A"})</p>
        <div class="btn-group">
          ${resolveBtn}
          <button class="delete-btn" onclick="deleteItem('${item._id}')">Delete Item</button>
        </div>
      `;
      container.appendChild(div);
    });
  })
  .catch(err => console.error(err));

// Fetch all users
fetch("http://localhost:8000/api/admin/users", {
  headers: {
    "Authorization": token
  }
})
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("adminUsersList");
    if (!container) return;

    if (data.length === 0) {
      container.innerHTML = "<p>No users registered yet.</p>";
      return;
    }

    data.forEach(user => {
      const div = document.createElement("div");
      div.classList.add("item-card");

      div.innerHTML = `
        <h3>${user.name}</h3>
        <p><span>Email:</span> ${user.email}</p>
        <p><span>Admin:</span> ${user.isAdmin ? "Yes" : "No"}</p>
        <p><span>Joined:</span> ${new Date(user.createdAt).toLocaleDateString()}</p>
        <br>
        <button class="delete-btn" onclick="deleteUser('${user._id}')">Delete User</button>
      `;
      container.appendChild(div);
    });
  })
  .catch(err => console.error(err));

// Mark item as resolved (admin)
async function resolveItem(id) {
  if (!confirm("Mark this item as resolved? It will be removed from the main listing.")) return;

  try {
    const res = await fetch(`http://localhost:8000/api/items/${id}/resolve`, {
      method: "PATCH",
      headers: {
        "Authorization": token
      }
    });

    const data = await res.json();

    if (res.ok) {
      alert("Item marked as resolved!");
      window.location.reload();
    } else {
      alert(data.error);
    }

  } catch (err) {
    console.error(err);
  }
}

// Delete item
async function deleteItem(id) {
  if (!confirm("Are you sure you want to delete this item?")) return;

  try {
    const res = await fetch(`http://localhost:8000/api/admin/items/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": token
      }
    });

    const data = await res.json();

    if (res.ok) {
      alert("Item deleted successfully!");
      window.location.reload();
    } else {
      alert(data.error);
    }

  } catch (err) {
    console.error(err);
  }
}

// Delete user
async function deleteUser(id) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    const res = await fetch(`http://localhost:8000/api/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": token
      }
    });

    const data = await res.json();

    if (res.ok) {
      alert("User deleted successfully!");
      window.location.reload();
    } else {
      alert(data.error);
    }

  } catch (err) {
    console.error(err);
  }
}