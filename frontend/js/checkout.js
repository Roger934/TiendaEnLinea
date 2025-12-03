// frontend/js/checkout.js

const API_URL = "http://localhost:3000/api";
const token = localStorage.getItem("token");

// ============================================
// VERIFICAR LOGIN AL CARGAR
// ============================================
window.addEventListener("DOMContentLoaded", async () => {
  if (!token) {
    alert("⚠️ Debes iniciar sesión");
    window.location.href = "login.html";
    return;
  }

  loadCartSummary();
});

// ============================================
// CARGAR RESUMEN DEL CARRITO
// ============================================
const loadCartSummary = async () => {
  try {
    const response = await fetch(`${API_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      displayCartSummary(data.items, data.subtotal);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

const displayCartSummary = (items, subtotal) => {
  const container = document.getElementById("cartSummary");

  if (items.length === 0) {
    container.innerHTML = "<p>Tu carrito está vacío</p>";
    return;
  }

  let html = "<ul>";
  items.forEach((item) => {
    html += `<li>${item.nombre} x ${item.cantidad} - $${(
      parseFloat(item.precio) * item.cantidad
    ).toFixed(2)}</li>`;
  });
  html += "</ul>";
  html += `<p><strong>Subtotal: $${parseFloat(subtotal).toFixed(
    2
  )}</strong></p>`;

  container.innerHTML = html;
  document.getElementById("totalAmount").textContent =
    parseFloat(subtotal).toFixed(2);
};

// ============================================
// PROCESAR ORDEN
// ============================================
document
  .getElementById("checkoutForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const direccion = document.getElementById("direccion").value;
    const ciudad = document.getElementById("ciudad").value;
    const codigoPostal = document.getElementById("codigoPostal").value;
    const pais = document.getElementById("pais").value;
    const telefono = document.getElementById("telefono").value;
    const metodoPago = document.querySelector(
      'input[name="metodoPago"]:checked'
    ).value;
    const codigoCupon = document.getElementById("codigoCupon").value;

    const messageEl = document.getElementById("message");
    messageEl.textContent = "Procesando compra...";
    messageEl.style.color = "blue";

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          direccion,
          ciudad,
          codigoPostal,
          pais,
          telefono,
          metodoPago,
          codigoCupon: codigoCupon || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        messageEl.textContent = `✅ ${data.message}! Orden #${data.ordenId}. Total: $${data.total}. Se envió la nota de compra a tu correo.`;
        messageEl.style.color = "green";

        // Limpiar formulario
        document.getElementById("checkoutForm").reset();

        // Redirigir al home después de 3 segundos
        setTimeout(() => {
          window.location.href = "index.html";
        }, 3000);
      } else {
        messageEl.textContent = "❌ " + data.message;
        messageEl.style.color = "red";
      }
    } catch (error) {
      messageEl.textContent = "❌ Error: " + error.message;
      messageEl.style.color = "red";
    }
  });
