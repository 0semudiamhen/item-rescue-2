// Protect page
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}

console.log("JS is connected");

// Display items
fetch("http://localhost:8000/api/items")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("itemsList");
    if (!container) return;

    if (data.length === 0) {
      container.innerHTML = "<p>No items posted yet.</p>";
      return;
    }

    data.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("item-card");

      // Contact info
      let contactInfo = "";
      if (item.contactType === "school_email" ) {
        contactInfo = `School Email on file`;
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
    : document.getElementById("email") ? localStorage.getItem("name") : ""
};

    try {
      const res = await fetch("http://localhost:8000/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
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