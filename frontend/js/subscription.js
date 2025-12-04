// frontend/js/subscription.js

// API_URL ya está declarado en products.js
// const API_URL = "http://localhost:3000/api";

document
  .getElementById("subscriptionForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("subscriptionEmail").value;

    // Mostrar loading
    Swal.fire({
      title: "Procesando...",
      text: "Por favor espera",
      background: "#1a2038",
      color: "#e0e7ff",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await fetch(`${API_URL}/subscription`, {
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
          title: "¡Suscrito!",
          text: data.message,
          background: "#1a2038",
          color: "#e0e7ff",
          confirmButtonColor: "#00d4ff",
        });

        document.getElementById("subscriptionForm").reset();
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
