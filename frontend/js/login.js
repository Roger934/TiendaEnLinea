// frontend/js/login.js

const API_URL = "http://localhost:3000/api";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const messageEl = document.getElementById("message");

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      // Guardar token en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      messageEl.textContent = "✅ " + data.message;
      messageEl.style.color = "green";

      // Redirigir al home
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } else {
      messageEl.textContent = "❌ " + data.message;
      messageEl.style.color = "red";
    }
  } catch (error) {
    messageEl.textContent = "❌ Error: " + error.message;
    messageEl.style.color = "red";
  }
});
