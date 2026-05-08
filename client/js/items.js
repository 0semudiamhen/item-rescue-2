// Protect page
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}

console.log("JS is connected");

// Store all items globally so we can filter without refetching
let allItems = [];
let currentFilter = "all";

// Render items to the page
function renderItems(items) {
  const container = document.getElementById("itemsList");
  if (!container) return;

  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = "<p>No items found.</p>";
    return;
  }

  items.forEach(item => {
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

    div.innerHTML = `
      <h3>${item.title}</h3>
      <span class="badge ${item.type}">${item.type}</span>
      ${studentServicesBanner}
      <p><span>Category:</span> ${item.category || "N/A"}</p>
      <p><span>Location:</span> ${item.location || "N/A"}</p>
      <p><span>Description:</span> ${item.description}</p>
      <p><span>Contact:</span> ${contactInfo || "N/A"}</p>
    `;
    container.appendChild(div);
  });
}

// Apply search and toggle filters
function applyFilters() {
  const searchInput = document.getElementById("searchInput");
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";

  const filtered = allItems.filter(item => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm) ||
      (item.category && item.category.toLowerCase().includes(searchTerm));

    const matchesType =
      currentFilter === "all" || item.type === currentFilter;

    return matchesSearch && matchesType;
  });

  renderItems(filtered);
}

// Fetch all items
fetch("http://localhost:8000/api/items")
  .then(res => res.json())
  .then(data => {
    allItems = data;
    renderItems(allItems);

    // Search input
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    // Toggle buttons
    const toggleBtns = document.querySelectorAll(".toggle-btn");
    toggleBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        // Remove active from all buttons
        toggleBtns.forEach(b => b.classList.remove("active"));
        // Add active to clicked button
        btn.classList.add("active");
        // Update current filter
        currentFilter = btn.dataset.filter;
        applyFilters();
      });
    });
  })
  .catch(err => console.error(err));

// Post item form
const form = document.getElementById("itemForm");

if (form) {

  // Show/hide student services checkbox based on item type
  const typeSelect = document.getElementById("type");
  const studentServicesDiv = document.getElementById("studentServicesDiv");

  if (typeSelect) {
    typeSelect.addEventListener("change", () => {
      if (typeSelect.value === "found") {
        studentServicesDiv.style.display = "block";
      } else {
        studentServicesDiv.style.display = "none";
      }
    });
  }

  // Show/hide contact input based on contact type
  const contactType = document.getElementById("contactType");
  const contactInputDiv = document.getElementById("contactInputDiv");

  if (contactType) {
    contactType.addEventListener("change", () => {
      if (contactType.value === "phone") {
        contactInputDiv.innerHTML = `<input type="tel" id="contactValue" placeholder="Enter your phone number">`;
      } else if (contactType.value === "personal_email") {
        contactInputDiv.innerHTML = `<input type="email" id="contactValue" placeholder="Enter your personal email">`;
      } else {
        contactInputDiv.innerHTML = "";
      }
    });
  }

  console.log("Form found");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Form submitted");

    const item = {
      title: document.getElementById("title").value,
      description: document.getElementById("description").value,
      category: document.getElementById("category").value,
      location: document.getElementById("location").value,
      type: document.getElementById("type").value,
      takenToStudentServices: document.getElementById("takenToStudentServices")
        ? document.getElementById("takenToStudentServices").checked
        : false,
      contactType: document.getElementById("contactType").value,
      contactValue: document.getElementById("contactValue")
        ? document.getElementById("contactValue").value
        : ""
    };

    try {
      const res = await fetch("http://localhost:8000/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify(item)
      });

      const data = await res.json();
      console.log("Item created:", data);

      alert("Item posted successfully!");
      form.reset();
      window.location.href = "index.html";

    } catch (err) {
      console.error(err);
    }
  });
}