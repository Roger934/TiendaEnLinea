// frontend/js/admin.js

const API_URL = "https://tiendaenlinea-eqmj.onrender.com/api";
let token = "";
let editingProductId = null;

// ============================================
// VERIFICAR QUE SEA ADMIN AL CARGAR
// ============================================
window.addEventListener("DOMContentLoaded", () => {
  token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token || !user || user.rol !== "admin") {
    alertError(
      "Solo administradores pueden acceder a esta página",
      "Acceso Denegado"
    );
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
    return;
  }

  document.getElementById("adminInfo").textContent = user.nombre;
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
    const response = await fetch(`${API_URL}/admin/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      displayProducts(data.productos);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

// ============================================
// MOSTRAR PRODUCTOS
// ============================================
const displayProducts = (productos) => {
  const container = document.getElementById("productsContainer");

  if (productos.length === 0) {
    container.innerHTML = "<p>No hay productos</p>";
    return;
  }

  let html = '<table style="width: 100%; border-collapse: collapse;">';
  html += `
    <thead>
      <tr style="background: var(--bg-secondary); color: var(--accent-blue);">
        <th style="padding: 1rem; text-align: left;">ID</th>
        <th style="padding: 1rem; text-align: left;">Nombre</th>
        <th style="padding: 1rem; text-align: left;">Precio</th>
        <th style="padding: 1rem; text-align: left;">Stock</th>
        <th style="padding: 1rem; text-align: left;">Categoría</th>
        <th style="padding: 1rem; text-align: left;">Oferta</th>
        <th style="padding: 1rem; text-align: left;">Acciones</th>
      </tr>
    </thead>
    <tbody>
  `;

  productos.forEach((p) => {
    html += `
      <tr style="border-bottom: 1px solid var(--border);">
        <td style="padding: 1rem;">${p.id}</td>
        <td style="padding: 1rem;">${p.nombre}</td>
        <td style="padding: 1rem;">$${parseFloat(p.precio).toFixed(2)}</td>
        <td style="padding: 1rem;">${p.stock}</td>
        <td style="padding: 1rem;">${p.categoria_nombre}</td>
        <td style="padding: 1rem;">${p.en_oferta ? "🔥 Sí" : "No"}</td>
        <td style="padding: 1rem;">
          <button onclick="editProduct(${
            p.id
          })" class="btn-secondary" style="margin: 0 0.25rem;">Editar</button>
          <button onclick="deleteProduct(${
            p.id
          })" class="btn-primary" style="margin: 0 0.25rem; background: var(--accent-pink);">Eliminar</button>
        </td>
      </tr>
    `;
  });

  html += "</tbody></table>";
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

  try {
    let response;

    if (editingProductId) {
      response = await fetch(`${API_URL}/admin/products/${editingProductId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
    } else {
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
      alertSuccess(
        data.message,
        editingProductId ? "¡Actualizado!" : "¡Creado!"
      );

      document.getElementById("productForm").reset();
      document.getElementById("imagePreview").innerHTML = "";
      document.getElementById("uploadMessage").textContent = "";
      editingProductId = null;
      document.getElementById("formTitle").textContent = "Crear Nuevo Producto";
      document.getElementById("submitBtn").textContent = "Crear Producto";
      document.getElementById("cancelBtn").style.display = "none";

      loadProducts();
    } else {
      alertError(data.message);
    }
  } catch (error) {
    alertError(error.message, "Error de Conexión");
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

      document.getElementById("productId").value = p.id;
      document.getElementById("nombre").value = p.nombre;
      document.getElementById("descripcion").value = p.descripcion;
      document.getElementById("precio").value = p.precio;
      document.getElementById("imagen_url").value = p.imagen_url;
      document.getElementById("stock").value = p.stock;
      document.getElementById("categoria_id").value = p.categoria_id;
      document.getElementById("en_oferta").checked = p.en_oferta;

      document.getElementById("formTitle").textContent = "Editar Producto";
      document.getElementById("submitBtn").textContent = "Actualizar Producto";
      document.getElementById("cancelBtn").style.display = "block";

      document.getElementById("imageFile").value = "";
      document.getElementById("uploadMessage").textContent = "";
      document.getElementById("imagePreview").innerHTML = `
        <p><strong>Imagen actual:</strong></p>
        <img src="${p.imagen_url}" style="width: 200px; height: 200px; object-fit: cover; margin-top: 10px;">
        <p><em>Sube una nueva imagen si deseas cambiarla</em></p>
      `;

      editingProductId = id;
      window.scrollTo(0, 0);
    }
  } catch (error) {
    alertError("No se pudo cargar el producto");
  }
};

// ============================================
// CANCELAR EDICIÓN
// ============================================
document.getElementById("cancelBtn").addEventListener("click", () => {
  document.getElementById("productForm").reset();
  document.getElementById("imagePreview").innerHTML = "";
  document.getElementById("uploadMessage").textContent = "";
  editingProductId = null;
  document.getElementById("formTitle").textContent = "Crear Nuevo Producto";
  document.getElementById("submitBtn").textContent = "Crear Producto";
  document.getElementById("cancelBtn").style.display = "none";
});

// ============================================
// ELIMINAR PRODUCTO
// ============================================
const deleteProduct = async (id) => {
  const result = await alertConfirm(
    "Esta acción no se puede deshacer",
    "¿Eliminar producto?"
  );

  if (!result.isConfirmed) return;

  try {
    const response = await fetch(`${API_URL}/admin/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (data.success) {
      alertSuccess(data.message, "¡Eliminado!");
      loadProducts();
    } else {
      alertError(data.message);
    }
  } catch (error) {
    alertError("No se pudo eliminar el producto");
  }
};

// ============================================
// SUBIR IMAGEN
// ============================================
document
  .getElementById("uploadImageBtn")
  .addEventListener("click", async () => {
    const fileInput = document.getElementById("imageFile");
    const file = fileInput.files[0];
    const messageEl = document.getElementById("uploadMessage");
    const previewEl = document.getElementById("imagePreview");

    if (!file) {
      messageEl.textContent = "⚠️ Selecciona una imagen primero";
      messageEl.style.color = "orange";
      return;
    }

    messageEl.textContent = "Subiendo imagen...";
    messageEl.style.color = "blue";

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(`${API_URL}/admin/upload-image`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        messageEl.textContent = "✅ Imagen subida exitosamente";
        messageEl.style.color = "green";

        document.getElementById("imagen_url").value = data.imageUrl;

        previewEl.innerHTML = `<img src="${data.imageUrl}" style="width: 200px; height: 200px; object-fit: cover; margin-top: 10px;">`;
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
        <p style="color: var(--accent-blue); font-size: 1.5rem; font-weight: 700;">
          $${parseFloat(data.totalVentas).toFixed(2)}
        </p>
        <p style="color: var(--text-secondary);">
          ${data.numeroOrdenes} órdenes completadas
        </p>
      `;
    }
  } catch (error) {
    document.getElementById("salesInfo").innerHTML =
      "<p>Error al cargar ventas</p>";
  }
});

// ============================================
// VER GRÁFICA DE VENTAS
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
      const categorias = data.data.map((item) => item.categoria);
      const ventas = data.data.map((item) => parseFloat(item.total_ventas));

      document.getElementById("salesChart").style.display = "block";

      if (window.myChart) {
        window.myChart.destroy();
      }

      const ctx = document.getElementById("salesChart").getContext("2d");
      window.myChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: categorias,
          datasets: [
            {
              label: "Total de Ventas ($)",
              data: ventas,
              backgroundColor: ["#00d4ff", "#b537f2", "#ff006e"],
              borderColor: ["#00d4ff", "#b537f2", "#ff006e"],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: { color: "#e0e7ff" },
            },
            title: {
              display: true,
              text: "Ventas por Categoría",
              color: "#00d4ff",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: "#e0e7ff",
                callback: function (value) {
                  return "$" + value.toFixed(2);
                },
              },
              grid: { color: "#2d3561" },
            },
            x: {
              ticks: { color: "#e0e7ff" },
              grid: { color: "#2d3561" },
            },
          },
        },
      });

      let html =
        '<table style="width: 100%; margin-top: 1rem; border-collapse: collapse;">';
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
          html += `<h4 style="color: var(--accent-blue); margin-top: 1rem;">${categoria}</h4>`;
          html += "<ul>";
          data.inventario[categoria].forEach((item) => {
            html += `<li style="color: var(--text-secondary);">${item.producto}: <strong style="color: var(--text-primary);">${item.stock}</strong> unidades</li>`;
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
