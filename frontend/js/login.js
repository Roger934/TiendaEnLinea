// frontend/js/login.js

const API_URL = "http://localhost:3000/api";

// ============================================
// CARGAR CAPTCHA AL INICIAR
// ============================================
window.addEventListener("DOMContentLoaded", () => {
  loadCaptcha();
});

// ============================================
// CARGAR CAPTCHA
// ============================================
const loadCaptcha = async () => {
  try {
    const response = await fetch(`${API_URL}/auth/captcha`);
    const data = await response.json();

    if (data.success) {
      document.getElementById("captchaContainer").innerHTML = data.captchaSvg;
      document.getElementById("captchaToken").value = data.captchaToken;
    }
  } catch (error) {
    console.error("Error al cargar captcha:", error);
  }
};

// ============================================
// REFRESCAR CAPTCHA
// ============================================
document.getElementById("refreshCaptcha").addEventListener("click", () => {
  loadCaptcha();
  document.getElementById("captchaInput").value = "";
});

// ============================================
// LOGIN
// ============================================
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const captchaText = document.getElementById("captchaInput").value;
  const captchaToken = document.getElementById("captchaToken").value;
  const messageEl = document.getElementById("message");

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, captchaText, captchaToken }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      messageEl.textContent = "✅ " + data.message;
      messageEl.style.color = "green";

      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } else {
      messageEl.textContent = "❌ " + data.message;
      messageEl.style.color = "red";

      // Recargar captcha después de error
      loadCaptcha();
      document.getElementById("captchaInput").value = "";
    }
  } catch (error) {
    messageEl.textContent = "❌ Error: " + error.message;
    messageEl.style.color = "red";

    // Recargar captcha después de error
    loadCaptcha();
    document.getElementById("captchaInput").value = "";
  }
});
