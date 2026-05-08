const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}

// Fetch user's own items
fetch("http://localhost:8000/api/items/mine", {
  headers: {
    "Authorization": token
  }
})
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("myItemsList");
    if (!container) return;

    if (data.length === 0) {
      container.innerHTML = "<p>You have not posted any items yet.</p>";
      return;
    }

    data.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("item-card");

      // Contact info
      let contactInfo = "";
      if (item.contactType === "school_email") {
        contactInfo = "School Email on file";
      } else if (item.contactType === "personal_email") {
        contactInfo = item.contactValue;
      } else if (item.contactType === "phone") {
        contactInfo = item.contactValue;
      }

      // Student services banner
      const studentServicesBanner = item.takenToStudentServices
        ? `<p class="student-services-badge">📦 Handed to Student Services — Cafeteria Building, adjacent to International Student Office</p>`
        : "";

      // Status badge
      const statusBadge = item.status === "resolved"
        ? `<span class="badge found">Resolved</span>`
        : `<span class="badge lost">Active</span>`;

      // Resolve button (only show if active)
      const resolveBtn = item.status === "active"
        ? `<button class="resolve-btn" onclick="resolveItem('${item._id}')">Mark as Resolved</button>`
        : `<p style="color: green; font-weight: 700;">✅ This item has been resolved</p>`;

      div.innerHTML = `
        <h3>${item.title}</h3>
        <span class="badge ${item.type}">${item.type}</span>
        ${statusBadge}
        ${studentServicesBanner}
        <p><span>Category:</span> ${item.category || "N/A"}</p>
        <p><span>Location:</span> ${item.location || "N/A"}</p>
        <p><span>Description:</span> ${item.description}</p>
        <p><span>Contact:</span> ${contactInfo || "N/A"}</p>
        <br>
        <div class="btn-group">
          ${resolveBtn}
          <button class="delete-btn" onclick="deleteItem('${item._id}')">Delete Item</button>
        </div>
      `;
      container.appendChild(div);
    });
  })
  .catch(err => console.error(err));

// Mark item as resolved
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
    const res = await fetch(`http://localhost:8000/api/items/${id}`, {
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