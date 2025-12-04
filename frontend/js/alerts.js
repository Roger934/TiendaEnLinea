// Éxito
function alertSuccess(message, title = "¡Éxito!") {
  Swal.fire({
    icon: "success",
    title: title,
    text: message,
    background: "#1a2038",
    color: "#e0e7ff",
    confirmButtonColor: "#00d4ff",
  });
}

// Error
function alertError(message, title = "Error") {
  Swal.fire({
    icon: "error",
    title: title,
    text: message,
    background: "#1a2038",
    color: "#e0e7ff",
    confirmButtonColor: "#ff006e",
  });
}

// Advertencia / Confirmación
function alertConfirm(message, title = "¿Estás seguro?") {
  return Swal.fire({
    icon: "warning",
    title: title,
    text: message,
    showCancelButton: true,
    confirmButtonText: "Sí",
    cancelButtonText: "Cancelar",
    background: "#1a2038",
    color: "#e0e7ff",
    confirmButtonColor: "#ff006e",
    cancelButtonColor: "#64748b",
  });
}
