// frontend/js/checkout.js

const API_URL = "http://localhost:3000/api";
const token = localStorage.getItem("token");

let subtotalGlobal = 0;

// ============================================
// VERIFICAR LOGIN AL CARGAR
// ============================================
window.addEventListener("DOMContentLoaded", async () => {
  if (!token) {
    alert("⚠️ Debes iniciar sesión");
    window.location.href = "login.html";
    return;
  }

  await loadCartSummary();
  setupCountryChangeListener();
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
      subtotalGlobal = parseFloat(data.subtotal);
      displayCartSummary(data.items, data.subtotal);
    } else {
      document.getElementById("cartSummary").innerHTML =
        "<p>Error al cargar carrito</p>";
    }
  } catch (error) {
    console.error("Error:", error);
    document.getElementById("cartSummary").innerHTML =
      "<p>Error al cargar carrito: " + error.message + "</p>";
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
};

// ============================================
// CALCULAR IMPUESTOS Y ENVÍO SEGÚN PAÍS
// ============================================
const calcularCostos = (pais) => {
  let tasaImpuesto = 0;
  let costoEnvio = 0;
  let nombreImpuesto = "Impuesto";

  switch (pais) {
    case "Mexico":
      tasaImpuesto = 0.16;
      costoEnvio = 10.0;
      nombreImpuesto = "IVA (16%)";
      break;
    case "USA":
      tasaImpuesto = 0.08;
      costoEnvio = 15.0;
      nombreImpuesto = "Sales Tax (8%)";
      break;
    case "España":
      tasaImpuesto = 0.21;
      costoEnvio = 12.0;
      nombreImpuesto = "IVA (21%)";
      break;
    case "Canada":
      tasaImpuesto = 0.13;
      costoEnvio = 18.0;
      nombreImpuesto = "HST (13%)";
      break;
    case "Argentina":
      tasaImpuesto = 0.21;
      costoEnvio = 25.0;
      nombreImpuesto = "IVA (21%)";
      break;
    case "Colombia":
      tasaImpuesto = 0.19;
      costoEnvio = 20.0;
      nombreImpuesto = "IVA (19%)";
      break;
    case "Chile":
      tasaImpuesto = 0.19;
      costoEnvio = 22.0;
      nombreImpuesto = "IVA (19%)";
      break;
    case "Peru":
      tasaImpuesto = 0.18;
      costoEnvio = 20.0;
      nombreImpuesto = "IGV (18%)";
      break;
    default:
      tasaImpuesto = 0.1;
      costoEnvio = 20.0;
      nombreImpuesto = "Impuesto (10%)";
  }

  const impuestos = subtotalGlobal * tasaImpuesto;
  const total = subtotalGlobal + impuestos + costoEnvio;

  return {
    nombreImpuesto,
    tasaImpuesto,
    impuestos,
    costoEnvio,
    total,
  };
};

// ============================================
// MOSTRAR PREVIEW DE COSTOS
// ============================================
const mostrarPreviewCostos = (pais) => {
  const container = document.getElementById("costPreview");

  if (!pais) {
    container.innerHTML =
      "<p><em>Selecciona un país para ver el desglose de costos</em></p>";
    return;
  }

  const costos = calcularCostos(pais);
  const cupon = document.getElementById("codigoCupon").value;

  let descuento = 0;
  let descuentoHtml = "";

  if (cupon && cupon.toUpperCase() === "BIENVENIDO10") {
    descuento = subtotalGlobal * 0.1;
    descuentoHtml = `
            <tr>
                <td>Descuento (BIENVENIDO10):</td>
                <td style="color: green;">-$${descuento.toFixed(2)}</td>
            </tr>
        `;
  }

  const totalFinal = costos.total - descuento;

  container.innerHTML = `
        <table border="1" style="width: 100%; border-collapse: collapse;">
            <tr>
                <td><strong>Subtotal:</strong></td>
                <td><strong>$${subtotalGlobal.toFixed(2)}</strong></td>
            </tr>
            <tr>
                <td>${costos.nombreImpuesto}:</td>
                <td>$${costos.impuestos.toFixed(2)}</td>
            </tr>
            <tr>
                <td>Envío a ${pais}:</td>
                <td>$${costos.costoEnvio.toFixed(2)}</td>
            </tr>
            ${descuentoHtml}
            <tr style="background-color: #f0f0f0;">
                <td><strong>TOTAL:</strong></td>
                <td><strong>$${totalFinal.toFixed(2)}</strong></td>
            </tr>
        </table>
    `;
};

// ============================================
// LISTENER PARA CAMBIO DE PAÍS
// ============================================
const setupCountryChangeListener = () => {
  const paisSelect = document.getElementById("pais");
  const cuponInput = document.getElementById("codigoCupon");

  if (paisSelect) {
    paisSelect.addEventListener("change", (e) => {
      console.log("País seleccionado:", e.target.value);
      mostrarPreviewCostos(e.target.value);
    });
  }

  if (cuponInput) {
    cuponInput.addEventListener("input", () => {
      const pais = paisSelect.value;
      if (pais) {
        mostrarPreviewCostos(pais);
      }
    });
  }
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

    if (!pais) {
      alert("⚠️ Debes seleccionar un país");
      return;
    }

    const messageEl = document.getElementById("message");
    messageEl.textContent =
      "Procesando compra... Esto puede tomar unos segundos.";
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

        document.getElementById("checkoutForm").reset();
        document.getElementById("costPreview").innerHTML =
          "<p><em>Compra finalizada exitosamente</em></p>";

        setTimeout(() => {
          window.location.href = "index.html";
        }, 3000);
      } else {
        messageEl.textContent = "❌ " + data.message;
        messageEl.style.color = "red";
      }
    } catch (error) {
      console.error("Error completo:", error);
      messageEl.textContent = "❌ Error: " + error.message;
      messageEl.style.color = "red";
    }
  });
