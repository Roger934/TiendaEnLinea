// frontend/js/reset-password.js

const API_URL = "http://localhost:3000/api";

// Obtener token de la URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

if (!token) {
  document.getElementById("message").textContent = "❌ Token no encontrado";
  document.getElementById("message").style.color = "red";
  document.getElementById("resetPasswordForm").style.display = "none";
}

document
  .getElementById("resetPasswordForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const messageEl = document.getElementById("message");

    // Validar que coincidan
    if (newPassword !== confirmPassword) {
      messageEl.textContent = "❌ Las contraseñas no coinciden";
      messageEl.style.color = "red";
      return;
    }

    messageEl.textContent = "Actualizando contraseña...";
    messageEl.style.color = "blue";

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        messageEl.textContent =
          "✅ " + data.message + " Redirigiendo al login...";
        messageEl.style.color = "green";

        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      } else {
        messageEl.textContent = "❌ " + data.message;
        messageEl.style.color = "red";
      }
    } catch (error) {
      messageEl.textContent = "❌ Error: " + error.message;
      messageEl.style.color = "red";
    }
  });
