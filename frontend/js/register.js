// frontend/js/register.js

const API_URL = "http://localhost:3000/api";

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;
    const messageEl = document.getElementById("message");

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre, email, password, password2 }),
      });

      const data = await response.json();

      if (data.success) {
        messageEl.textContent = "✅ " + data.message;
        messageEl.style.color = "green";

        // Redirigir al login después de 2 segundos
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
