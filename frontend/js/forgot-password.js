// frontend/js/forgot-password.js

const API_URL = "http://localhost:3000/api";

document
  .getElementById("forgotPasswordForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const messageEl = document.getElementById("message");

    messageEl.textContent = "Enviando...";
    messageEl.style.color = "blue";

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        messageEl.textContent = "✅ " + data.message;
        messageEl.style.color = "green";
        document.getElementById("forgotPasswordForm").reset();
      } else {
        messageEl.textContent = "❌ " + data.message;
        messageEl.style.color = "red";
      }
    } catch (error) {
      messageEl.textContent = "❌ Error: " + error.message;
      messageEl.style.color = "red";
    }
  });
