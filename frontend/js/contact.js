// frontend/js/contact.js

document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const mensaje = document.getElementById("mensaje").value;

  // Alerta de envío
  Swal.fire({
    title: "Enviando mensaje...",
    text: "Por favor espera",
    background: "#1a2038",
    color: "#e0e7ff",
    didOpen: () => Swal.showLoading(),
  });

  try {
    const response = await fetch("http://localhost:3000/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre, email, mensaje }),
    });

    const data = await response.json();

    if (data.success) {
      Swal.fire({
        icon: "success",
        title: "Mensaje enviado",
        text: data.message,
        background: "#1a2038",
        color: "#e0e7ff",
        confirmButtonColor: "#00d4ff",
      });

      document.getElementById("contactForm").reset();
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
      title: "Error en el servidor",
      text: error.message,
      background: "#1a2038",
      color: "#e0e7ff",
      confirmButtonColor: "#ff006e",
    });
  }
});
