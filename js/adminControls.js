// adminControls.js

export function esAdmin() {
  return localStorage.getItem("userRole") === "admin";
}

export function mostrarPanelAdmin() {
  const overlay = document.getElementById("adminPanelOverlay");
  if (!overlay) return;

  overlay.classList.remove("hidden");

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      cerrarPanelAdmin();
    }
  });
}

export function cerrarPanelAdmin() {
  const overlay = document.getElementById("adminPanelOverlay");
  if (overlay) {
    overlay.classList.add("hidden");
  }
}

export function initControlesAdmin() {
  if (!esAdmin()) return;

  const btn = document.getElementById("btnAdminPanel");
  if (btn) {
    btn.addEventListener("click", () => {
      mostrarPanelAdmin();
    });
  }
}
