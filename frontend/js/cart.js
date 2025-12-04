// frontend/js/cart.js

const API_URL = "https://tiendaenlinea-eqmj.onrender.com/api";
const token = localStorage.getItem("token");

// ============================================
// INICIO
// ============================================
window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // =============================
  // Actualizar header
  // =============================
  // Actualizar header
  if (token && user.nombre) {
    // Mostrar nombre y logout
    const userNameEl = document.getElementById("userName");
    const loginLink = document.getElementById("loginLink");
    const logoutBtn = document.getElementById("logoutBtn");
    const adminLink = document.getElementById("adminLink");

    if (userNameEl) {
      userNameEl.textContent = user.nombre;
      userNameEl.style.display = "flex";
    }

    if (loginLink) loginLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";

    // Mostrar Admin si es admin
    if (adminLink && user.rol === "admin") {
      adminLink.style.display = "inline-block";
    }
  }

  // Mostrar Admin link si es admin
  const adminLink = document.getElementById("adminLink");
  if (adminLink && user.rol === "admin") {
    adminLink.style.display = "inline-block";
  }

  // =============================
  // Carrito
  // =============================
  if (token) {
    loadCartFromDB();
  } else {
    // Mostrar un alert bonito
    Swal.fire({
      icon: "info",
      title: "Inicia sesión",
      text: "Debes iniciar sesión para ver tu carrito",
      background: "#1a2038",
      color: "#e0e7ff",
      confirmButtonColor: "#00d4ff",
    }).then(() => {
      window.location.href = "login.html";
    });

    // También mostrar mensaje visual dentro del contenedor del carrito (opcional)
    document.getElementById("cartContainer").innerHTML = `
      <div class="empty-cart fancy-message">
        <p><strong>Tu carrito está vacío</strong></p>
        <p>Inicia sesión para ver tus productos guardados</p>
        <a href="login.html" class="btn-primary" style="margin-top: 1rem;">Iniciar Sesión</a>
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
        <h3>Tu carrito está vacío</h3>
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
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
       stroke-linecap="round" stroke-linejoin="round">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14H6L5 6"/>
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
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
