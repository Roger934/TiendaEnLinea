// frontend/js/cart.js

const API_URL = "http://localhost:3000/api";
const token = localStorage.getItem("token");

// ============================================
// INICIO
// ============================================
window.addEventListener("DOMContentLoaded", () => {
  if (token) {
    loadCartFromDB();
  } else {
    document.getElementById("cartContainer").innerHTML =
      '<p>⚠️ Debes <a href="login.html">iniciar sesión</a> para ver tu carrito</p>';
    document.getElementById("checkoutBtn").style.display = "none";
  }
});

// ============================================
// CARGAR CARRITO DESDE BD
// ============================================
const loadCartFromDB = async () => {
  try {
    const response = await fetch(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (data.success) {
      displayCartFromDB(data.items, data.subtotal);
    } else {
      document.getElementById("cartContainer").innerHTML =
        "<p>No se pudo obtener el carrito</p>";
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("cartContainer").innerHTML =
      "<p>Error al cargar carrito</p>";
  }
};

// ============================================
// MOSTRAR CARRITO DE BD
// ============================================
const displayCartFromDB = (items, subtotal) => {
  const container = document.getElementById("cartContainer");

  if (!items.length) {
    container.innerHTML = "<p>Tu carrito está vacío</p>";
    document.getElementById("checkoutBtn").style.display = "none";
    return;
  }

  let html = "";

  items.forEach((item) => {
    const itemSubtotal = parseFloat(item.precio) * item.cantidad;

    html += `
      <div style="border: 1px solid black; padding: 10px; margin: 10px 0;">
        <h3>${item.nombre}</h3>
        <p>Precio: $${parseFloat(item.precio).toFixed(2)}</p>

        <p>
          Cantidad:
          <button onclick="updateQuantityDB(${item.id}, ${
      item.cantidad - 1
    })">-</button>
          ${item.cantidad}
          <button onclick="updateQuantityDB(${item.id}, ${
      item.cantidad + 1
    })">+</button>
        </p>

        <p><strong>Subtotal: $${itemSubtotal.toFixed(2)}</strong></p>

        <button onclick="removeFromCartDB(${item.id})">Eliminar</button>
      </div>
    `;
  });

  container.innerHTML = html;
  document.getElementById("totalAmount").textContent =
    parseFloat(subtotal).toFixed(2);
  document.getElementById("checkoutBtn").style.display = "inline-block";
};

// ============================================
// ACTUALIZAR CANTIDAD EN BD
// ============================================
const updateQuantityDB = async (cartItemId, newQuantity) => {
  if (newQuantity < 1) {
    return removeFromCartDB(cartItemId);
  }

  try {
    const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ cantidad: newQuantity }),
    });

    const data = await response.json();

    if (data.success) {
      loadCartFromDB();
    } else {
      alert("❌ " + data.message);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// ============================================
// ELIMINAR ITEM DEL CARRITO EN BD
// ============================================
const removeFromCartDB = async (cartItemId) => {
  try {
    const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (data.success) {
      loadCartFromDB();
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// ============================================
// PROCEDER AL PAGO
// ============================================
document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (!token) {
    alert("⚠️ Debes iniciar sesión para finalizar tu compra");
    return (window.location.href = "login.html");
  }
  window.location.href = "checkout.html";
});
