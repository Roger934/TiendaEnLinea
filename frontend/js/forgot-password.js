// frontend/js/forgot-password.js

const API_URL = "https://tiendaenlinea-eqmj.onrender.com/api";

document
  .getElementById("forgotPasswordForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value;

    // Mostrar loading
    Swal.fire({
      title: "Enviando...",
      text: "Por favor espera",
      background: "#1a2038",
      color: "#e0e7ff",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "¡Correo Enviado!",
          text: data.message,
          background: "#1a2038",
          color: "#e0e7ff",
          confirmButtonColor: "#00d4ff",
        });

        document.getElementById("forgotPasswordForm").reset();
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
