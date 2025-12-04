// frontend/js/home.js

const API_URL = "http://localhost:3000/api";

// Verificar si hay token al cargar la página
window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const userInfoEl = document.getElementById("userInfo");

  if (!token) {
    alertError("Debes iniciar sesión para acceder a esta página");
    window.location.href = "login.html";
    return;
  }

  try {
    // Verificar el token con el backend
    const response = await fetch(`${API_URL}/auth/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      const user = JSON.parse(localStorage.getItem("user"));

      userInfoEl.innerHTML = `
        <p><strong>Nombre:</strong> ${user.nombre}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Rol:</strong> ${user.rol}</p>
      `;
    } else {
      alertError("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
      localStorage.clear();
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Error:", error);
    alertError("Error de conexión. Por favor inicia sesión nuevamente.");
    localStorage.clear();
    window.location.href = "login.html";
  }
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  alertConfirm("¿Deseas cerrar sesión?", "Confirmar Logout").then((result) => {
    if (result.isConfirmed) {
      localStorage.clear();
      alertSuccess("Sesión cerrada correctamente");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);
    }
  });
});
