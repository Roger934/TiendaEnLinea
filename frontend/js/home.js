// frontend/js/home.js

const API_URL = "http://localhost:3000/api";

// Verificar si hay token al cargar la página
window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const userInfoEl = document.getElementById("userInfo");

  if (!token) {
    // Si no hay token, redirigir al login
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
                <p>Nombre: ${user.nombre}</p>
                <p>Email: ${user.email}</p>
                <p>Rol: ${user.rol}</p>
            `;
    } else {
      // Token inválido, redirigir al login
      localStorage.clear();
      window.location.href = "login.html";
    }
  } catch (error) {
    console.error("Error:", error);
    localStorage.clear();
    window.location.href = "login.html";
  }
});

// Logout

document.getElementById("logoutBtn").addEventListener("click", () => {
  // Limpiar TODO el localStorage
  localStorage.clear();

  window.location.href = "login.html";
});
