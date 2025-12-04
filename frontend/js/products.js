// frontend/js/products.js

const API_URL = "http://localhost:3000/api";

// ============================================
// VERIFICAR SI HAY USUARIO LOGUEADO Y CARGAR PRODUCTOS
// ============================================
window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Actualizar header si está logueado
  if (token && user.nombre) {
    document.getElementById("userName").textContent = user.nombre;
    document.getElementById("userName").style.display = "flex";
    document.getElementById("loginLink").style.display = "none";
    document.getElementById("logoutBtn").style.display = "block";
  }

  // IMPORTANTE: Cargar productos al inicio
  loadProducts();
  updateCartCount();
});

// ============================================
// LOGOUT
// ============================================
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.reload();
});

// ... resto del código (loadProducts, displayProducts, etc)
// ============================================
// CARGAR PRODUCTOS
// ============================================
const loadProducts = async (filters = {}) => {
  try {
    // Construir URL con filtros
    let url = `${API_URL}/products?`;

    if (filters.categoria_id) url += `categoria_id=${filters.categoria_id}&`;
    if (filters.precio_min) url += `precio_min=${filters.precio_min}&`;
    if (filters.precio_max) url += `precio_max=${filters.precio_max}&`;
    if (filters.en_oferta) url += `en_oferta=true&`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.success) {
      displayProducts(data.productos);
      document.getElementById("totalProductos").textContent = data.total;
    } else {
      document.getElementById("productosContainer").innerHTML =
        "<p>Error al cargar productos</p>";
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("productosContainer").innerHTML =
      "<p>Error al cargar productos</p>";
  }
};

// ============================================
// MOSTRAR PRODUCTOS
// ============================================
const displayProducts = (productos) => {
  const container = document.getElementById("productosContainer");
  const token = localStorage.getItem("token");

  if (productos.length === 0) {
    container.innerHTML = "<p>No se encontraron productos</p>";
    return;
  }

  let html = "";

  productos.forEach((producto) => {
    const disponible = producto.stock > 0;
    const precioFormateado = `$${parseFloat(producto.precio).toFixed(2)}`;

    html += `
      <div class="product-card">
        ${
          producto.en_oferta
            ? '<span class="product-badge">🔥 OFERTA</span>'
            : ""
        }
        
        <img src="${producto.imagen_url}" alt="${
      producto.nombre
    }" class="product-image">
        
        <p class="product-category">${producto.categoria_nombre}</p>
        <h3 class="product-title">${producto.nombre}</h3>
        <p class="product-description">${producto.descripcion}</p>
        <p class="product-price">${precioFormateado}</p>
        <p class="product-stock ${!disponible ? "out-of-stock" : ""}">
          ${
            disponible ? `✅ ${producto.stock} disponibles` : "❌ No disponible"
          }
        </p>
        
        ${
          disponible
            ? token
              ? `<button class="btn-primary" onclick="addToCart(${
                  producto.id
                }, '${producto.nombre}', ${parseFloat(
                  producto.precio
                )})">Agregar al carrito 🛒</button>`
              : `<button class="btn-primary" onclick="promptLogin()">Agregar al carrito 🛒</button>`
            : '<button class="btn-secondary" disabled>No disponible</button>'
        }
      </div>
    `;
  });

  container.innerHTML = html;
};
// ============================================
// AGREGAR AL CARRITO
// ============================================
const addToCart = async (id, nombre, precio) => {
  const token = localStorage.getItem("token");

  // Verificación de seguridad
  if (!token) {
    alert("⚠️ Debes iniciar sesión para agregar productos al carrito");
    window.location.href = "login.html";
    return;
  }

  // Usuario logueado - Agregar a BD
  await addToCartDB(id);
};

// ============================================
// AGREGAR A BD (usuario logueado)
// ============================================
const addToCartDB = async (producto_id) => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`${API_URL}/cart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        producto_id: producto_id,
        cantidad: 1,
      }),
    });

    const data = await response.json();

    if (data.success) {
      alert("✅ " + data.message);
      updateCartCount(); // Actualizar contador
    } else {
      alert("❌ " + data.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("❌ Error al agregar al carrito");
  }
};

// ============================================
// AGREGAR A LOCALSTORAGE (sin login)   <-------------
// ============================================
// const addToCartLocal = (id, nombre, precio) => {
//   let cart = JSON.parse(localStorage.getItem("cart")) || [];

//   // Verificar si el producto ya existe
//   const existingProduct = cart.find((item) => item.id === id);

//   if (existingProduct) {
//     existingProduct.cantidad++;
//   } else {
//     cart.push({
//       id: id,
//       nombre: nombre,
//       precio: precio,
//       cantidad: 1,
//     });
//   }

//   localStorage.setItem("cart", JSON.stringify(cart));
//   alert("Producto agregado al carrito");
//   updateCartCount();
// };

// ============================================
// ACTUALIZAR CONTADOR DEL CARRITO
// ============================================
const updateCartCount = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    document.getElementById("cartCount").textContent = "0";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
    console.error("Error al actualizar carrito:", error);
  }
};

// ============================================
// FILTROS
// ============================================
document.getElementById("filtrarBtn").addEventListener("click", () => {
  const filters = {
    categoria_id: document.getElementById("categoriaSelect").value,
    precio_min: document.getElementById("precioMin").value,
    precio_max: document.getElementById("precioMax").value,
    en_oferta: document.getElementById("enOferta").checked,
  };

  loadProducts(filters);
});

document.getElementById("limpiarBtn").addEventListener("click", () => {
  document.getElementById("categoriaSelect").value = "";
  document.getElementById("precioMin").value = "";
  document.getElementById("precioMax").value = "";
  document.getElementById("enOferta").checked = false;
  loadProducts();
});

// ============================================
// PEDIR LOGIN SI INTENTA AGREGAR SIN ESTAR LOGUEADO
// ============================================
const promptLogin = () => {
  alert("⚠️ Debes iniciar sesión para agregar productos al carrito");
  window.location.href = "login.html";
};

// ============================================
// VER CARRITO
// ============================================
document.getElementById("verCarritoBtn").addEventListener("click", () => {
  window.location.href = "cart.html";
});
