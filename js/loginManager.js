document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");

  form.addEventListener("submit", (event) => {
    event.preventDefault(); // Evita que el formulario recargue la página
    // Aquí en el futuro podrías validar el usuario/contraseña

    // Simulamos que se inicia sesión correctamente
    window.location.href = "index.html"; // Redirige a la página principal
  });
});
