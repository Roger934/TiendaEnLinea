// frontend/js/cart.js

// ============================================
// CARGAR CARRITO
// ============================================
window.addEventListener("DOMContentLoaded", () => {
  displayCart();
});

const displayCart = () => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
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
                    <button onclick="updateQuantity(${index}, -1)">-</button>
                    ${item.cantidad}
                    <button onclick="updateQuantity(${index}, 1)">+</button>
                </p>
                <p><strong>Subtotal: $${subtotal.toFixed(2)}</strong></p>
                <button onclick="removeFromCart(${index})">Eliminar</button>
            </div>
        `;
  });

  container.innerHTML = html;
  document.getElementById("totalAmount").textContent = total.toFixed(2);
  document.getElementById("checkoutBtn").style.display = "inline-block";
};

// ============================================
// MODIFICAR CANTIDAD
// ============================================
const updateQuantity = (index, change) => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  cart[index].cantidad += change;

  if (cart[index].cantidad <= 0) {
    cart.splice(index, 1);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
};

// ============================================
// ELIMINAR DEL CARRITO
// ============================================
const removeFromCart = (index) => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
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
    alert("✅ Redirigiendo al checkout... (por implementar)");
    // window.location.href = 'checkout.html';
  }
});
