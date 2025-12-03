const API_URL = "http://localhost:3000/api";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const messageEl = document.getElementById("message");

  // Validación rápida
  if (!email || !password) {
    messageEl.textContent = "❌ Completa todos los campos";
    messageEl.style.color = "red";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Comprobar estado HTTP
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      messageEl.textContent = "✅ " + data.message;
      messageEl.style.color = "green";

      setTimeout(() => (window.location.href = "index.html"), 1000);
    } else {
      messageEl.textContent = "❌ " + data.message;
      messageEl.style.color = "red";
    }
  } catch (error) {
    messageEl.textContent = `❌ Error: ${error.message}`;
    messageEl.style.color = "red";
  }
});
