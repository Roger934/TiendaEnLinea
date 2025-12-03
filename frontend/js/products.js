// frontend/js/products.js

const API_URL = "http://localhost:3000/api";

// ============================================
// VERIFICAR SI HAY USUARIO LOGUEADO
// ============================================
window.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (token && user) {
    document.getElementById("userName").textContent = `Hola, ${user.nombre}`;
    document.getElementById("logoutBtn").style.display = "inline-block";
  }

  // Cargar productos al inicio
  loadProducts();
  updateCartCount();
});

// ============================================
// LOGOUT
// ============================================
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.reload();
});

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

  if (productos.length === 0) {
    container.innerHTML = "<p>No se encontraron productos</p>";
    return;
  }

  let html = "";

  productos.forEach((producto) => {
    const disponible = producto.stock > 0;
    const precioFormateado = `$${parseFloat(producto.precio).toFixed(2)}`; // ← CAMBIO AQUÍ

    html += `
            <div style="border: 1px solid black; padding: 10px; margin: 10px 0;">
                <h3>${producto.nombre}</h3>
                <p><strong>Categoría:</strong> ${producto.categoria_nombre}</p>
                <p><strong>Precio:</strong> ${precioFormateado} ${
      producto.en_oferta ? "🔥 EN OFERTA" : ""
    }</p>
                <p><strong>Descripción:</strong> ${producto.descripcion}</p>
                <p><strong>Stock:</strong> ${
                  disponible ? producto.stock + " disponibles" : "No disponible"
                }</p>
                
                ${
                  disponible
                    ? `<button onclick="addToCart(${producto.id}, '${
                        producto.nombre
                      }', ${parseFloat(
                        producto.precio
                      )})">Agregar al carrito</button>` // ← CAMBIO AQUÍ TAMBIÉN
                    : '<p style="color: red;">Producto no disponible</p>'
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

  if (token) {
    // Usuario logueado - Agregar a BD
    await addToCartDB(id);
  } else {
    // Usuario NO logueado - Agregar a localStorage
    addToCartLocal(id, nombre, precio);
  }
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
// AGREGAR A LOCALSTORAGE (sin login)
// ============================================
const addToCartLocal = (id, nombre, precio) => {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  // Verificar si el producto ya existe
  const existingProduct = cart.find((item) => item.id === id);

  if (existingProduct) {
    existingProduct.cantidad++;
  } else {
    cart.push({
      id: id,
      nombre: nombre,
      precio: precio,
      cantidad: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  alert("Producto agregado al carrito");
  updateCartCount();
};

// ============================================
// ACTUALIZAR CONTADOR DEL CARRITO
// ============================================
const updateCartCount = async () => {
  const token = localStorage.getItem("token");
  let totalItems = 0;

  if (token) {
    // Usuario logueado - Contar desde BD
    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        data.items.forEach((item) => {
          totalItems += item.cantidad;
        });
      }
    } catch (error) {
      console.error("Error al obtener carrito:", error);
    }
  } else {
    // Usuario NO logueado - Contar desde localStorage
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart.forEach((item) => {
      totalItems += item.cantidad;
    });
  }

  const cartCountEl = document.getElementById("cartCount");
  if (cartCountEl) {
    cartCountEl.textContent = totalItems;
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
// VER CARRITO
// ============================================
document.getElementById("verCarritoBtn").addEventListener("click", () => {
  window.location.href = "cart.html";
});
