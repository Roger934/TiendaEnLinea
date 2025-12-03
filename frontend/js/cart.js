// frontend/js/cart.js
const API_URL = "http://localhost:3000/api";
const token = localStorage.getItem("token");

window.addEventListener("DOMContentLoaded", () => {
  if (token) {
    console.log("✅ Usuario logueado - Carrito desde BD");
    loadCartFromDB();
  } else {
    console.log("✅ Usuario NO logueado - Carrito desde localStorage");
    loadCartFromLocalStorage();
  }
});

// ============================================
// CARGAR CARRITO DESDE BD
// ============================================
const loadCartFromDB = async () => {
  try {
    const response = await fetch(`${API_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      displayCartFromDB(data.items, data.subtotal);
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

  if (items.length === 0) {
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
// MODIFICAR CANTIDAD EN BD
// ============================================
const updateQuantityDB = async (cartItemId, newQuantity) => {
  if (newQuantity < 1) {
    removeFromCartDB(cartItemId);
    return;
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
// ELIMINAR DE BD
// ============================================
const removeFromCartDB = async (cartItemId) => {
  try {
    const response = await fetch(`${API_URL}/cart/${cartItemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
// CARGAR CARRITO DESDE LOCALSTORAGE
// ============================================
const loadCartFromLocalStorage = () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  displayCartFromLocalStorage(cart);
};

const displayCartFromLocalStorage = (cart) => {
  const container = document.getElementById("cartContainer");

  if (cart.length === 0) {
    container.innerHTML = "<p>Tu carrito está vacío</p>";
    return;
  }

  let html = "";
  let total = 0;

  cart.forEach((item, index) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    html += `
            <div style="border: 1px solid black; padding: 10px; margin: 10px 0;">
                <h3>${item.nombre}</h3>
                <p>Precio: $${item.precio.toFixed(2)}</p>
                <p>
                    Cantidad: 
                    <button onclick="updateQuantityLocal(${index}, -1)">-</button>
                    ${item.cantidad}
                    <button onclick="updateQuantityLocal(${index}, 1)">+</button>
                </p>
                <p><strong>Subtotal: $${subtotal.toFixed(2)}</strong></p>
                <button onclick="removeFromCartLocal(${index})">Eliminar</button>
            </div>
        `;
  });

  container.innerHTML = html;
  document.getElementById("totalAmount").textContent = total.toFixed(2);
  document.getElementById("checkoutBtn").style.display = "inline-block";
};

// ============================================
// MODIFICAR CANTIDAD LOCAL
// ============================================
const updateQuantityLocal = (index, change) => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart[index].cantidad += change;

  if (cart[index].cantidad <= 0) {
    cart.splice(index, 1);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  loadCartFromLocalStorage();
};

// ============================================
// ELIMINAR LOCAL
// ============================================
const removeFromCartLocal = (index) => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCartFromLocalStorage();
};

// ============================================
// PROCEDER AL PAGO
// ============================================
document.getElementById("checkoutBtn").addEventListener("click", () => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("⚠️ Debes iniciar sesión para finalizar tu compra");
    window.location.href = "login.html";
  } else {
    window.location.href = "checkout.html";
  }
});
