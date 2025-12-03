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

      // ============================================
      // MIGRAR CARRITO DE LOCALSTORAGE A BD
      // ============================================
      const cartLocal = JSON.parse(localStorage.getItem("cart")) || [];

      if (cartLocal.length > 0) {
        console.log("🛒 Migrando carrito a BD:", cartLocal);

        try {
          await fetch(`${API_URL}/cart/sync`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${data.token}`,
            },
            body: JSON.stringify({ items: cartLocal }),
          });

          // ⚠️ IMPORTANTE: Limpiar carrito local DESPUÉS de sincronizar
          localStorage.removeItem("cart");
          console.log("✅ Carrito sincronizado y limpiado de localStorage");
        } catch (error) {
          console.error("Error al sincronizar carrito:", error);
        }
      } else {
        console.log("✅ No hay carrito local para sincronizar");
      }

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
