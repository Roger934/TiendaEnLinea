// frontend/js/register.js

const API_URL = "https://tiendaenlinea-eqmj.onrender.com/api";

document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;

    // Mostrar loading
    Swal.fire({
      title: "Registrando...",
      text: "Por favor espera",
      background: "#1a2038",
      color: "#e0e7ff",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nombre, email, password, password2 }),
      });

      const data = await response.json();

      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "¡Registro Exitoso!",
          text: data.message,
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
