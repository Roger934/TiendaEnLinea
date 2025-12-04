// frontend/js/checkout.js

const API_URL = "http://localhost:3000/api";
const token = localStorage.getItem("token");

let subtotalGlobal = 0;

// ============================================
// VERIFICAR LOGIN AL CARGAR
// ============================================
window.addEventListener("DOMContentLoaded", async () => {
  if (!token) {
    alertError("Debes iniciar sesión para continuar", "Sesión Requerida");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 2000);
    return;
  }

  // Actualizar header
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.nombre) {
    document.getElementById("userName").textContent = user.nombre;
    document.getElementById("userName").style.display = "flex";
    document.getElementById("logoutBtn").style.display = "block";
  }

  // Mostrar Admin link si es admin
  const adminLink = document.getElementById("adminLink");
  if (adminLink && user.rol === "admin") {
    adminLink.style.display = "inline-block";
  }

  await loadCartSummary();
  setupCountryChangeListener();
  setupPaymentMethodListener();
  renderPaymentFields("tarjeta"); // Inicializar con tarjeta
});

// ============================================
// LOGOUT
// ============================================
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "index.html";
});

// ============================================
// CARGAR RESUMEN DEL CARRITO
// ============================================
const loadCartSummary = async () => {
  try {
    const response = await fetch(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
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
      "<p>Error: " + error.message + "</p>";
  }
};

const displayCartSummary = (items, subtotal) => {
  const container = document.getElementById("cartSummary");

  if (items.length === 0) {
    container.innerHTML = "<p>Tu carrito está vacío</p>";
    return;
  }

  let html = '<div class="summary-items">';
  items.forEach((item) => {
    html += `
      <div class="summary-item">
        <span>${item.nombre} x ${item.cantidad}</span>
        <span>$${(parseFloat(item.precio) * item.cantidad).toFixed(2)}</span>
      </div>
    `;
  });
  html += "</div>";
  html += `<div class="summary-subtotal">Subtotal: $${parseFloat(
    subtotal
  ).toFixed(2)}</div>`;

  container.innerHTML = html;
};

// ============================================
// CALCULAR COSTOS SEGÚN PAÍS
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

  return { nombreImpuesto, tasaImpuesto, impuestos, costoEnvio, total };
};

// ============================================
// MOSTRAR PREVIEW DE COSTOS
// ============================================
const mostrarPreviewCostos = (pais) => {
  const container = document.getElementById("costPreview");

  if (!pais) {
    container.innerHTML =
      "<p><em>Selecciona un país para ver el desglose</em></p>";
    return;
  }

  const costos = calcularCostos(pais);
  const cupon = document.getElementById("codigoCupon").value;

  let descuento = 0;
  let descuentoHtml = "";

  if (cupon && cupon.toUpperCase() === "BIENVENIDO10") {
    descuento = subtotalGlobal * 0.1;
    descuentoHtml = `
      <div class="cost-line discount">
        <span>Descuento (BIENVENIDO10):</span>
        <span>-$${descuento.toFixed(2)}</span>
      </div>
    `;
  }

  const totalFinal = costos.total - descuento;

  container.innerHTML = `
    <div class="cost-breakdown">
      <div class="cost-line">
        <span>Subtotal:</span>
        <span>$${subtotalGlobal.toFixed(2)}</span>
      </div>
      <div class="cost-line">
        <span>${costos.nombreImpuesto}:</span>
        <span>$${costos.impuestos.toFixed(2)}</span>
      </div>
      <div class="cost-line">
        <span>Envío a ${pais}:</span>
        <span>$${costos.costoEnvio.toFixed(2)}</span>
      </div>
      ${descuentoHtml}
      <div class="cost-line total">
        <span>TOTAL:</span>
        <span>$${totalFinal.toFixed(2)}</span>
      </div>
    </div>
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
// MOSTRAR CAMPOS SEGÚN MÉTODO DE PAGO
// ============================================
const renderPaymentFields = (metodo) => {
  const paymentFields = document.getElementById("paymentFields");

  if (metodo === "tarjeta") {
    paymentFields.innerHTML = `
      <div class="form-group">
        <label>Número de tarjeta:</label>
        <input type="text" id="numeroTarjeta" placeholder="XXXX-XXXX-XXXX-XXXX" required />
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Fecha de expiración:</label>
          <input type="text" id="expiracion" placeholder="MM/AA" required />
        </div>

        <div class="form-group">
          <label>CVV:</label>
          <input type="text" id="cvv" placeholder="123" required />
        </div>
      </div>
    `;
  }

  if (metodo === "transferencia") {
    paymentFields.innerHTML = `
      <div class="payment-info">
        <h4>Datos Bancarios</h4>
        <p><strong>Banco:</strong> BBVA</p>
        <p><strong>Cuenta:</strong> 0123456789</p>
        <p><strong>CLABE:</strong> 123456789012345678</p>
        <p style="color: var(--accent-blue); margin-top: 1rem;">
          Una vez hecha la transferencia, tu orden se procesará automáticamente.
        </p>
      </div>
    `;
  }

  if (metodo === "oxxo") {
    const referencia = Math.floor(Math.random() * 900000000000) + 100000000000;

    paymentFields.innerHTML = `
      <div class="payment-info">
        <h4>Pago en OXXO</h4>
        <p>Lleva esta referencia a cualquier tienda OXXO:</p>
        <p class="oxxo-reference">${referencia}</p>
        <p style="color: var(--accent-blue); margin-top: 1rem;">
          Tu orden se confirmará cuando realices el pago.
        </p>
      </div>
    `;
  }
};

const setupPaymentMethodListener = () => {
  document.querySelectorAll('input[name="metodoPago"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      renderPaymentFields(e.target.value);
    });
  });
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
      alertError("Debes seleccionar un país", "Campo Requerido");
      return;
    }

    // Datos de pago simulados
    let datosPago = {};

    if (metodoPago === "tarjeta") {
      const numeroTarjeta = document.getElementById("numeroTarjeta")?.value;
      const expiracion = document.getElementById("expiracion")?.value;
      const cvv = document.getElementById("cvv")?.value;

      if (!numeroTarjeta || !expiracion || !cvv) {
        alertError("Completa los datos de la tarjeta", "Datos Incompletos");
        return;
      }

      datosPago = { numeroTarjeta, expiracion, cvv };
    }

    if (metodoPago === "transferencia") {
      datosPago = { referenciaTransferencia: "pendiente" };
    }

    if (metodoPago === "oxxo") {
      datosPago = {
        referenciaOxxo:
          document.querySelector(".oxxo-reference")?.textContent || "pendiente",
      };
    }

    // Mostrar alerta de procesamiento
    Swal.fire({
      title: "Procesando compra...",
      text: "Por favor espera",
      background: "#1a2038",
      color: "#e0e7ff",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

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
          datosPago,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "¡Compra Exitosa!",
          html: `
          <p>Orden #${data.ordenId}</p>
          <p><strong>Total: $${data.total}</strong></p>
          <p>Se envió la nota de compra a tu correo.</p>
        `,
          background: "#1a2038",
          color: "#e0e7ff",
          confirmButtonColor: "#00d4ff",
        }).then(() => {
          window.location.href = "index.html";
        });
      } else {
        alertError(data.message, "Error en la Compra");
      }
    } catch (error) {
      console.error("Error:", error);
      alertError(error.message, "Error de Conexión");
    }
  });
