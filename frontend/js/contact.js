// frontend/js/contact.js

document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const mensaje = document.getElementById("mensaje").value;
  const messageEl = document.getElementById("message");

  messageEl.textContent = "Enviando mensaje...";
  messageEl.style.color = "blue";

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
      messageEl.textContent = "✅ " + data.message;
      messageEl.style.color = "green";
      document.getElementById("contactForm").reset();
    } else {
      messageEl.textContent = "❌ " + data.message;
      messageEl.style.color = "red";
    }
  } catch (error) {
    messageEl.textContent = "❌ Error: " + error.message;
    messageEl.style.color = "red";
  }
});
