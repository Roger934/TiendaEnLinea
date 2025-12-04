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

  // Mostrar loading
  Swal.fire({
    title: "Iniciando sesión...",
    text: "Por favor espera",
    background: "#1a2038",
    color: "#e0e7ff",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

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

      Swal.fire({
        icon: "success",
        title: "¡Bienvenido!",
        text: data.message,
        background: "#1a2038",
        color: "#e0e7ff",
        confirmButtonColor: "#00d4ff",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        window.location.href =
          data.user.rol === "admin" ? "admin.html" : "index.html";
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: data.message,
        background: "#1a2038",
        color: "#e0e7ff",
        confirmButtonColor: "#ff006e",
      });

      // Recargar captcha después de error
      loadCaptcha();
      document.getElementById("captchaInput").value = "";
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error de Conexión",
      text: error.message,
      background: "#1a2038",
      color: "#e0e7ff",
      confirmButtonColor: "#ff006e",
    });

    // Recargar captcha después de error
    loadCaptcha();
    document.getElementById("captchaInput").value = "";
  }
});
