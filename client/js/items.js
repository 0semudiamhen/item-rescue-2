// Protect page
const token = localStorage.getItem("token");
if (!token) {
  window.location.href = "login.html";
}

console.log("JS is connected");

fetch("http://localhost:8000/api/items")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("itemsList");
    if (!container) return;

    data.forEach(item => {
      const div = document.createElement("div");
      div.innerHTML = `
        <h3>${item.title}</h3>
        <p><strong>Type:</strong> ${item.type}</p>
        <p><strong>Category:</strong> ${item.category}</p>
        <p><strong>Location:</strong> ${item.location}</p>
        <p><strong>Description:</strong> ${item.description}</p>
        <hr>
      `;
      container.appendChild(div);
    });
  })
  .catch(err => console.error(err));

const form = document.getElementById("itemForm");

if (form) {
  console.log("Form found");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Form submitted");
    const item = {
      title: document.getElementById("title").value,
      description: document.getElementById("description").value,
      category: document.getElementById("category").value,
      location: document.getElementById("location").value,
      type: document.getElementById("type").value
    };

    try {
      const res = await fetch("http://localhost:8000/api/items", { // ← changed to 8000
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

    } catch (err) {
      console.error(err);
    }
  });
}