// frontend/js/subscription.js

// No declarar API_URL aquí, ya está en products.js <--------------------------- OJO
// const API_URL = "http://localhost:3000/api";

document
  .getElementById("subscriptionForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("subscriptionEmail").value;
    const messageEl = document.getElementById("subscriptionMessage");

    messageEl.textContent = "Procesando...";
    messageEl.style.color = "blue";

    try {
      const response = await fetch(`${API_URL}/subscription`, {
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
        document.getElementById("subscriptionForm").reset();
      } else {
        messageEl.textContent = "❌ " + data.message;
        messageEl.style.color = "red";
      }
    } catch (error) {
      messageEl.textContent = "❌ Error: " + error.message;
      messageEl.style.color = "red";
    }
  });
