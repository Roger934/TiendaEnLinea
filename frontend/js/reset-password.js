window.API_URL =
  window.API_URL || "https://tiendaenlinea-eqmj.onrender.com/api";

// ----------------------------
// 1️⃣ Obtener token de la URL
// ----------------------------
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

// Agregar aquí
console.log("Token recibido desde URL:", token);

// ----------------------------
// 2️⃣ Validar que exista el token
// ----------------------------
if (!token) {
  Swal.fire({
    icon: "error",
    title: "Token No Encontrado",
    text: "El enlace de recuperación no es válido",
    background: "#1a2038",
    color: "#e0e7ff",
    confirmButtonColor: "#ff006e",
  }).then(() => {
    window.location.href = "login.html";
  });

  const form = document.getElementById("resetPasswordForm");
  if (form) form.style.display = "none";

  // Detener ejecución
  throw new Error("Token no encontrado");
}

// ----------------------------
// 3️⃣ Evento submit del formulario
// ----------------------------
document
  .getElementById("resetPasswordForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validar que coincidan
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden",
        background: "#1a2038",
        color: "#e0e7ff",
        confirmButtonColor: "#ff006e",
      });
      return;
    }

    // ----------------------------
    // 4️⃣ Mostrar logs para depuración
    // ----------------------------
    console.log("🔑 Token enviado al backend:", token);
    console.log("🔑 Nueva contraseña:", newPassword);

    // ----------------------------
    // 5️⃣ Mostrar loading
    // ----------------------------
    Swal.fire({
      title: "Actualizando contraseña...",
      text: "Por favor espera",
      background: "#1a2038",
      color: "#e0e7ff",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    // ----------------------------
    // 6️⃣ Enviar petición al backend
    // ----------------------------
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();
      console.log("📥 Respuesta del backend:", data);

      // ----------------------------
      // 7️⃣ Manejo de la respuesta
      // ----------------------------
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "¡Contraseña Actualizada!",
          text: data.message + " Redirigiendo al login...",
          background: "#1a2038",
          color: "#e0e7ff",
          confirmButtonColor: "#00d4ff",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          window.location.href = "login.html";
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "No se pudo actualizar la contraseña",
          background: "#1a2038",
          color: "#e0e7ff",
          confirmButtonColor: "#ff006e",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error de Conexión",
        text: error.message,
        background: "#1a2038",
        color: "#e0e7ff",
        confirmButtonColor: "#ff006e",
      });
    }
  });
