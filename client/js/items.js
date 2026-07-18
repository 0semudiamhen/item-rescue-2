// Protect page
const token = localStorage.getItem("token") || sessionStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}

console.log("JS is connected");

// Store all items globally so we can filter without refetching
let allItems = [];
let currentFilter = "all";
document.body.dataset.filterMood = currentFilter;

// Hero text per filter
const heroTitles = {
  all: "Lost Something? Found Something?",
  lost: "Found Something?",
  found: "Lost Something?"
};

function updateHeroText(filter) {
  const heroH1 = document.querySelector(".hero h1");
  if (heroH1) heroH1.textContent = heroTitles[filter] || heroTitles.all;
}

function updateFilterCounts() {
  const allCount = document.getElementById("allCount");
  const lostCount = document.getElementById("lostCount");
  const foundCount = document.getElementById("foundCount");

  if (allCount) allCount.textContent = allItems.length;
  if (lostCount) lostCount.textContent = allItems.filter(item => item.type === "lost").length;
  if (foundCount) foundCount.textContent = allItems.filter(item => item.type === "found").length;
}

// Render items to the page
function renderItems(items) {
  const container = document.getElementById("itemsList");
  if (!container) return;

  container.innerHTML = "";

  if (items.length === 0) {
    container.innerHTML = `<p class="empty-state">No items found.</p>`;
    return;
  }

  items.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("item-card");

    // Contact info — show actual email if school email selected
    let contactInfo = "";
    let contactAction = "";
    if (item.contactType === "school_email") {
      contactInfo = item.contactEmail || "School Email on file";
      if (item.contactEmail) {
        contactAction = `<a href="mailto:${item.contactEmail}" class="contact-btn">✉ Send Email</a>`;
      }
    } else if (item.contactType === "personal_email") {
      contactInfo = item.contactValue;
      contactAction = `<a href="mailto:${item.contactValue}" class="contact-btn">✉ Send Email</a>`;
    } else if (item.contactType === "phone") {
      contactInfo = item.contactValue;
      contactAction = `<a href="tel:${item.contactValue}" class="contact-btn">📞 Call</a>`;
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
      <p><span>Date:</span> ${item.dateOccurred ? new Date(item.dateOccurred).toLocaleDateString() : "N/A"}</p>
      <p><span>Description:</span> ${item.description}</p>
      <p><span>Contact:</span> ${contactInfo || "N/A"}</p>
      ${contactAction}
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
    updateFilterCounts();
    renderItems(allItems);

    // Search input
    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", applyFilters);
    }

    // Filter switch
    const filterSwitch = document.getElementById("itemFilterSwitch");
    const toggleBtns = document.querySelectorAll(".toggle-btn");
    toggleBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        toggleBtns.forEach(b => {
          b.classList.remove("active");
          b.setAttribute("aria-pressed", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-pressed", "true");
        currentFilter = btn.dataset.filter;
        if (filterSwitch) {
          filterSwitch.dataset.active = currentFilter;
        }
        document.body.dataset.filterMood = currentFilter;
        updateHeroText(currentFilter);
        applyFilters();
      });
    });
  })
  .catch(err => console.error(err));

// Post item form
const form = document.getElementById("itemForm");

if (form) {

  const categorySelect = document.getElementById("category");
  const otherCategoryDiv = document.getElementById("otherCategoryDiv");
  const otherCategoryInput = document.getElementById("otherCategory");

  if (categorySelect && otherCategoryDiv && otherCategoryInput) {
    categorySelect.addEventListener("change", () => {
      if (categorySelect.value === "Other") {
        otherCategoryDiv.style.display = "block";
        otherCategoryInput.required = true;
      } else {
        otherCategoryDiv.style.display = "none";
        otherCategoryInput.required = false;
        otherCategoryInput.value = "";
      }
    });
  }

  const typeSelect = document.getElementById("type");
  const studentServicesDiv = document.getElementById("studentServicesDiv");
  const dateOccurredLabel = document.getElementById("dateOccurredLabel");
  const dateOccurredInput = document.getElementById("dateOccurred");

  // Set max date to today so users can't pick a future date
  if (dateOccurredInput) {
    dateOccurredInput.max = new Date().toISOString().split("T")[0];
  }

  if (typeSelect) {
    typeSelect.addEventListener("change", () => {
      if (typeSelect.value === "found") {
        studentServicesDiv.style.display = "block";
        if (dateOccurredLabel) dateOccurredLabel.textContent = "Date Found";
      } else {
        studentServicesDiv.style.display = "none";
        if (dateOccurredLabel) dateOccurredLabel.textContent = "Date Lost";
      }
    });
  }

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

    const selectedCategory = document.getElementById("category").value;
    const customCategory = document.getElementById("otherCategory")
      ? document.getElementById("otherCategory").value.trim()
      : "";

    if (selectedCategory === "Other" && !customCategory) {
      notify("Please enter the item category.", "error");
      return;
    }

    const item = {
      title: document.getElementById("title").value,
      description: document.getElementById("description").value,
      category: selectedCategory === "Other" ? customCategory : selectedCategory,
      location: document.getElementById("location").value,
      type: document.getElementById("type").value,
      dateOccurred: document.getElementById("dateOccurred").value || null,
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

      notify("Item posted successfully.", "success");
      form.reset();
      setTimeout(() => {
        window.location.href = "index.html";
      }, 700);

    } catch (err) {
      console.error(err);
      notify("Unable to post item right now.", "error");
    }
  });
}