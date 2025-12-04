// frontend/js/cart.js

const API_URL = "http://localhost:3000/api";
const token = localStorage.getItem("token");

// ============================================
// INICIO
// ============================================
window.addEventListener("DOMContentLoaded", () => {
  // Actualizar header
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (token && user.nombre) {
    document.getElementById("userName").textContent = user.nombre;
    document.getElementById("userName").style.display = "flex";
    document.getElementById("loginLink").style.display = "none";
    document.getElementById("logoutBtn").style.display = "block";
  }

  // Mostrar Admin link si es admin
  const adminLink = document.getElementById("adminLink");
  if (adminLink && user.rol === "admin") {
    adminLink.style.display = "inline-block";
  }

  // Cargar carrito
  if (token) {
    loadCartFromDB();
  } else {
    document.getElementById("cartContainer").innerHTML = `
      <div class="empty-cart">
        <p>⚠️ Debes <a href="login.html">iniciar sesión</a> para ver tu carrito</p>
      </div>
    `;
    document.getElementById("checkoutBtn").style.display = "none";
  }
});

// ============================================
// LOGOUT
// ============================================
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
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
      updateCartCount();
    } else {
      document.getElementById("cartContainer").innerHTML = `
        <div class="empty-cart">
          <p>No se pudo obtener el carrito</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("Error:", error);
    alertError("Error al cargar el carrito", "Error de Conexión");
    document.getElementById("cartContainer").innerHTML = `
      <div class="empty-cart">
        <p>Error al cargar carrito</p>
      </div>
    `;
  }
};

// ============================================
// ACTUALIZAR CONTADOR DEL CARRITO
// ============================================
const updateCartCount = async () => {
  if (!token) return;

  try {
    const response = await fetch(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (data.success) {
      const totalItems = data.items.reduce(
        (sum, item) => sum + item.cantidad,
        0
      );
      document.getElementById("cartCount").textContent = totalItems;
    }
  } catch (error) {
    console.error("Error al actualizar contador:", error);
  }
};

// ============================================
// MOSTRAR CARRITO
// ============================================
const displayCartFromDB = (items, subtotal) => {
  const container = document.getElementById("cartContainer");

  if (!items.length) {
    container.innerHTML = `
      <div class="empty-cart">
        <h3>Tu carrito está vacío 🛒</h3>
        <p>Agrega productos desde nuestro catálogo</p>
        <a href="index.html" class="btn-primary" style="margin-top: 1rem;">Ver Productos</a>
      </div>
    `;
    document.getElementById("checkoutBtn").style.display = "none";
    return;
  }

  let html = '<div class="cart-items">';

  items.forEach((item) => {
    const itemSubtotal = parseFloat(item.precio) * item.cantidad;

    html += `
      <div class="cart-item">
        <img src="${item.imagen_url || "/images/default.jpg"}" alt="${
      item.nombre
    }" class="cart-item-image">
        
        <div class="cart-item-info">
          <h3 class="cart-item-title">${item.nombre}</h3>
          <p class="cart-item-price">$${parseFloat(item.precio).toFixed(2)}</p>
        </div>

        <div class="cart-item-quantity">
          <button onclick="updateQuantityDB(${item.id}, ${
      item.cantidad - 1
    })" class="qty-btn">−</button>
          <span class="qty-value">${item.cantidad}</span>
          <button onclick="updateQuantityDB(${item.id}, ${
      item.cantidad + 1
    })" class="qty-btn">+</button>
        </div>

        <div class="cart-item-subtotal">
          <p><strong>$${itemSubtotal.toFixed(2)}</strong></p>
        </div>

        <button onclick="removeFromCartDB(${
          item.id
        })" class="cart-item-remove" title="Eliminar">
          🗑️
        </button>
      </div>
    `;
  });

  html += "</div>";
  container.innerHTML = html;

  document.getElementById("totalAmount").textContent =
    parseFloat(subtotal).toFixed(2);
  document.getElementById("checkoutBtn").style.display = "block";
};

// ============================================
// ACTUALIZAR CANTIDAD
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
      alertError(data.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alertError("No se pudo actualizar la cantidad");
  }
};

// ============================================
// ELIMINAR DEL CARRITO
// ============================================
const removeFromCartDB = async (cartItemId) => {
  const result = await alertConfirm(
    "¿Quieres eliminar este producto del carrito?",
    "¿Eliminar producto?"
  );

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (data.success) {
      alertSuccess("Producto eliminado del carrito", "¡Eliminado!");
      loadCartFromDB();
    }
  } catch (error) {
    console.error("Error:", error);
    alertError("No se pudo eliminar el producto");
  }
};

// ============================================
// PROCEDER AL PAGO
// ============================================
document.getElementById("checkoutBtn").addEventListener("click", () => {
  if (!token) {
    alertError("Debes iniciar sesión para continuar", "Sesión Requerida");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
    return;
  }
  window.location.href = "checkout.html";
});
