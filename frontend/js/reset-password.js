// frontend/js/reset-password.js

const API_URL = "https://tiendaenlinea-eqmj.onrender.com/api";

// Obtener token de la URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get("token");

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
  document.getElementById("resetPasswordForm").style.display = "none";
}

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

    // Mostrar loading
    Swal.fire({
      title: "Actualizando contraseña...",
      text: "Por favor espera",
      background: "#1a2038",
      color: "#e0e7ff",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

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
          text: data.message,
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
