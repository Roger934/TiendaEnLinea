// frontend/js/admin.js

const API_URL = "http://localhost:3000/api";
let token = "";
let editingProductId = null;

// ============================================
// VERIFICAR QUE SEA ADMIN AL CARGAR
// ============================================
window.addEventListener("DOMContentLoaded", () => {
  token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // Verificar que esté logueado y sea admin
  if (!token || !user || user.rol !== "admin") {
    alert("⚠️ Acceso denegado. Solo administradores.");
    window.location.href = "login.html";
    return;
  }

  document.getElementById("adminInfo").textContent = `Admin: ${user.nombre}`;

  // Cargar productos
  loadProducts();
});

// ============================================
// LOGOUT
// ============================================
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

// ============================================
// CARGAR PRODUCTOS
// ============================================
const loadProducts = async () => {
  try {
    const response = await fetch(`${API_URL}/products`);
    const data = await response.json();

    if (data.success) {
      displayProducts(data.productos);
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("productsContainer").innerHTML =
      "<p>Error al cargar productos</p>";
  }
};

// ============================================
// MOSTRAR PRODUCTOS CON BOTONES DE EDITAR/ELIMINAR
// ============================================
const displayProducts = (productos) => {
  const container = document.getElementById("productsContainer");

  if (productos.length === 0) {
    container.innerHTML = "<p>No hay productos</p>";
    return;
  }

  let html =
    '<table border="1" style="width: 100%; border-collapse: collapse;">';
  html += `
        <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Categoría</th>
            <th>Oferta</th>
            <th>Acciones</th>
        </tr>
    `;

  productos.forEach((p) => {
    html += `
            <tr>
                <td>${p.id}</td>
                <td>${p.nombre}</td>
                <td>$${parseFloat(p.precio).toFixed(2)}</td>
                <td>${p.stock}</td>
                <td>${p.categoria_nombre}</td>
                <td>${p.en_oferta ? "🔥 Sí" : "No"}</td>
                <td>
                    <button onclick="editProduct(${p.id})">Editar</button>
                    <button onclick="deleteProduct(${p.id})">Eliminar</button>
                </td>
            </tr>
        `;
  });

  html += "</table>";
  container.innerHTML = html;
};

// ============================================
// CREAR O ACTUALIZAR PRODUCTO
// ============================================
document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const productData = {
    nombre: document.getElementById("nombre").value,
    descripcion: document.getElementById("descripcion").value,
    precio: parseFloat(document.getElementById("precio").value),
    imagen_url:
      document.getElementById("imagen_url").value || "/images/default.jpg",
    stock: parseInt(document.getElementById("stock").value),
    categoria_id: parseInt(document.getElementById("categoria_id").value),
    en_oferta: document.getElementById("en_oferta").checked,
  };

  const messageEl = document.getElementById("formMessage");

  try {
    let response;

    if (editingProductId) {
      // ACTUALIZAR producto existente
      response = await fetch(`${API_URL}/admin/products/${editingProductId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
    } else {
      // CREAR nuevo producto
      response = await fetch(`${API_URL}/admin/products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
    }

    const data = await response.json();

    if (data.success) {
      messageEl.textContent = "✅ " + data.message;
      messageEl.style.color = "green";

      // Limpiar formulario
      document.getElementById("productForm").reset();
      editingProductId = null;
      document.getElementById("formTitle").textContent = "Crear Nuevo Producto";
      document.getElementById("submitBtn").textContent = "Crear Producto";
      document.getElementById("cancelBtn").style.display = "none";

      // Recargar lista
      loadProducts();
    } else {
      messageEl.textContent = "❌ " + data.message;
      messageEl.style.color = "red";
    }
  } catch (error) {
    messageEl.textContent = "❌ Error: " + error.message;
    messageEl.style.color = "red";
  }
});

// ============================================
// EDITAR PRODUCTO
// ============================================
const editProduct = async (id) => {
  try {
    const response = await fetch(`${API_URL}/products/${id}`);
    const data = await response.json();

    if (data.success) {
      const p = data.producto;

      // Llenar el formulario
      document.getElementById("productId").value = p.id;
      document.getElementById("nombre").value = p.nombre;
      document.getElementById("descripcion").value = p.descripcion;
      document.getElementById("precio").value = p.precio;
      document.getElementById("imagen_url").value = p.imagen_url;
      document.getElementById("stock").value = p.stock;
      document.getElementById("categoria_id").value = p.categoria_id;
      document.getElementById("en_oferta").checked = p.en_oferta;

      // Cambiar título y botón
      document.getElementById("formTitle").textContent = "Editar Producto";
      document.getElementById("submitBtn").textContent = "Actualizar Producto";
      document.getElementById("cancelBtn").style.display = "inline-block";

      editingProductId = id;

      // Scroll al formulario
      window.scrollTo(0, 0);
    }
  } catch (error) {
    alert("Error al cargar producto");
  }
};

// ============================================
// CANCELAR EDICIÓN
// ============================================
document.getElementById("cancelBtn").addEventListener("click", () => {
  document.getElementById("productForm").reset();
  editingProductId = null;
  document.getElementById("formTitle").textContent = "Crear Nuevo Producto";
  document.getElementById("submitBtn").textContent = "Crear Producto";
  document.getElementById("cancelBtn").style.display = "none";
  document.getElementById("formMessage").textContent = "";
});

// ============================================
// ELIMINAR PRODUCTO
// ============================================
const deleteProduct = async (id) => {
  if (!confirm("¿Estás seguro de eliminar este producto?")) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/admin/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      alert("✅ " + data.message);
      loadProducts();
    } else {
      alert("❌ " + data.message);
    }
  } catch (error) {
    alert("❌ Error al eliminar producto");
  }
};

// ============================================
// VER TOTAL DE VENTAS
// ============================================
document.getElementById("loadSalesBtn").addEventListener("click", async () => {
  try {
    const response = await fetch(`${API_URL}/admin/sales`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      document.getElementById("salesInfo").innerHTML = `
                <p><strong>Total de ventas:</strong> $${parseFloat(
                  data.totalVentas
                ).toFixed(2)}</p>
                <p><strong>Número de órdenes:</strong> ${data.numeroOrdenes}</p>
            `;
    }
  } catch (error) {
    document.getElementById("salesInfo").innerHTML =
      "<p>Error al cargar ventas</p>";
  }
});

// ============================================
// VER GRÁFICA DE VENTAS (con Chart.js)
// ============================================
document.getElementById("loadChartBtn").addEventListener("click", async () => {
  try {
    const response = await fetch(`${API_URL}/admin/sales-chart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      // Extraer datos de la API
      const categorias = data.data.map((item) => item.categoria);
      const ventas = data.data.map((item) => parseFloat(item.total_ventas));

      // Mostrar el canvas
      document.getElementById("salesChart").style.display = "block";

      // Destruir gráfica anterior si existe
      if (window.myChart) {
        window.myChart.destroy();
      }

      // Crear nueva gráfica
      const ctx = document.getElementById("salesChart").getContext("2d");
      window.myChart = new Chart(ctx, {
        type: "bar", // Puedes cambiar a 'pie' si prefieres pastel
        data: {
          labels: categorias,
          datasets: [
            {
              label: "Total de Ventas ($)",
              data: ventas,
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
              ],
              borderColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56",
                "#4BC0C0",
                "#9966FF",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
            title: {
              display: true,
              text: "Ventas por Categoría",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                callback: function (value) {
                  return "$" + value.toFixed(2);
                },
              },
            },
          },
        },
      });

      // Mostrar también la tabla (opcional)
      let html = "<h4>Datos detallados:</h4>";
      html +=
        '<table border="1" style="border-collapse: collapse; margin-top: 20px;">';
      html +=
        "<tr><th>Categoría</th><th>Total Vendidos</th><th>Total Ventas</th></tr>";

      data.data.forEach((item) => {
        html += `
                    <tr>
                        <td>${item.categoria}</td>
                        <td>${item.total_vendidos}</td>
                        <td>$${parseFloat(item.total_ventas).toFixed(2)}</td>
                    </tr>
                `;
      });

      html += "</table>";
      document.getElementById("chartData").innerHTML = html;
    }
  } catch (error) {
    document.getElementById("chartData").innerHTML =
      "<p>Error al cargar gráfica</p>";
  }
});

// ============================================
// VER INVENTARIO
// ============================================
document
  .getElementById("loadInventoryBtn")
  .addEventListener("click", async () => {
    try {
      const response = await fetch(`${API_URL}/admin/inventory`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        let html = "";

        for (const categoria in data.inventario) {
          html += `<h4>${categoria}</h4>`;
          html += "<ul>";
          data.inventario[categoria].forEach((item) => {
            html += `<li>${item.producto}: <strong>${item.stock}</strong> unidades</li>`;
          });
          html += "</ul>";
        }

        document.getElementById("inventoryData").innerHTML = html;
      }
    } catch (error) {
      document.getElementById("inventoryData").innerHTML =
        "<p>Error al cargar inventario</p>";
    }
  });
