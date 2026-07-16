function showToast(message, type = "info") {
  let toastRoot = document.getElementById("toastRoot");

  if (!toastRoot) {
    toastRoot = document.createElement("div");
    toastRoot.id = "toastRoot";
    toastRoot.className = "toast-root";
    document.body.appendChild(toastRoot);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastRoot.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 10);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

function notify(message, type = "info") {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
  }
}
