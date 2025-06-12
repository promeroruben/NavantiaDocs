document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const passwordHash = await sha256(password);

    fetch("data/users.json")
      .then(response => response.json())
      .then(users => {
        const user = users.find(u => u.username === username);

        if (!user) {
          alert("Usuario no encontrado");
          return;
        }

        if (user.passwordHash !== passwordHash) {
          alert("Contraseña incorrecta");
          return;
        }

        // Usuario y contraseña correctos
        localStorage.setItem("loggedUser", username);
        window.location.href = "index.html";
      })
      .catch(error => {
        console.error("Error cargando usuarios:", error);
        alert("Error al verificar usuario");
      });
  });
});

//Checkbox para ver contraseña mientras escribes
document.getElementById("togglePassword").addEventListener("change", function () {
  const passwordField = document.getElementById("password");
  passwordField.type = this.checked ? "text" : "password";
});

// Función para obtener el hash SHA-256 de un texto
async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

