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

    // **AQUÍ AGREGAMOS LOS LOGS**
    console.log("Token enviado al backend:", token);
    console.log("Nueva contraseña:", newPassword);

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
