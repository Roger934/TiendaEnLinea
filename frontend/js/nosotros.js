// frontend/js/nosotros.js
const API_URL = "https://tiendaenlinea-eqmj.onrender.com/api";

document.addEventListener("DOMContentLoaded", () => {
  // ============================================
  // ACTUALIZAR HEADER (login / logout / nombre)
  // ============================================
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const userNameEl = document.getElementById("userName");
  const loginLink = document.getElementById("loginLink");
  const logoutBtn = document.getElementById("logoutBtn");
  const adminLink = document.getElementById("adminLink");

  if (token && user.nombre) {
    if (userNameEl) {
      userNameEl.textContent = user.nombre;
      userNameEl.style.display = "flex";
    }

    if (loginLink) loginLink.style.display = "none";
    if (logoutBtn) logoutBtn.style.display = "block";

    // Admin
    if (adminLink && user.rol === "admin") {
      adminLink.style.display = "inline-block";
    }
  } else {
    // Usuario NO logueado
    if (loginLink) loginLink.style.display = "block";
    if (logoutBtn) logoutBtn.style.display = "none";
    if (userNameEl) userNameEl.style.display = "none";
    if (adminLink) adminLink.style.display = "none";
  }

  // ============================================
  // DROPDOWN DE USUARIO
  // ============================================
  initUserDropdown();

  // ============================================
  // FAQ Accordion
  // ============================================
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Cerrar todas
      faqItems.forEach((otherItem) => {
        otherItem.classList.remove("active");
      });

      if (!isActive) item.classList.add("active");
    });
  });

  updateCartCount();
});

// Actualizar contador del carrito
const updateCartCount = () => {
  const token = localStorage.getItem("token");
  const cartCount = document.getElementById("cartCount");

  if (!token) {
    const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
    const total = localCart.reduce((sum, item) => sum + item.cantidad, 0);
    if (cartCount) cartCount.textContent = total;
  } else {
    fetch(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const total = data.items.reduce(
            (sum, item) => sum + item.cantidad,
            0
          );
          if (cartCount) cartCount.textContent = total;
        }
      })
      .catch((err) => console.error("Error:", err));
  }
};

// ============================================
// DROPDOWN DE USUARIO EN HEADER
// ============================================
const initUserDropdown = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const dropdownBtn = document.getElementById("userDropdownBtn");
  const userDropdown = document.querySelector(".user-dropdown");
  const userNameDropdown = document.getElementById("userNameDropdown");
  const dropdownGuest = document.getElementById("dropdownGuest");
  const dropdownLoggedIn = document.getElementById("dropdownLoggedIn");
  const dropdownUserName = document.getElementById("dropdownUserName");
  const dropdownAdminLink = document.getElementById("dropdownAdminLink");
  const dropdownLogoutBtn = document.getElementById("dropdownLogoutBtn");

  // Toggle dropdown
  if (dropdownBtn) {
    dropdownBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle("active");
    });
  }

  // Cerrar al hacer clic fuera
  document.addEventListener("click", (e) => {
    if (userDropdown && !userDropdown.contains(e.target)) {
      userDropdown.classList.remove("active");
    }
  });

  // Si está logueado
  if (token && user.nombre) {
    if (userNameDropdown) userNameDropdown.textContent = user.nombre;
    if (dropdownGuest) dropdownGuest.style.display = "none";
    if (dropdownLoggedIn) dropdownLoggedIn.style.display = "block";
    if (dropdownUserName) dropdownUserName.textContent = `Hola, ${user.nombre}`;

    if (user.rol === "admin" && dropdownAdminLink) {
      dropdownAdminLink.style.display = "block";
    }
  } else {
    if (userNameDropdown) userNameDropdown.textContent = "Cuenta";
    if (dropdownGuest) dropdownGuest.style.display = "block";
    if (dropdownLoggedIn) dropdownLoggedIn.style.display = "none";
  }

  // Logout
  if (dropdownLogoutBtn) {
    dropdownLogoutBtn.addEventListener("click", () => {
      Swal.fire({
        icon: "warning",
        title: "¿Cerrar sesión?",
        showCancelButton: true,
        confirmButtonText: "Sí, salir",
        cancelButtonText: "Cancelar",
        background: "#1a2038",
        color: "#e0e7ff",
        confirmButtonColor: "#ff006e",
        cancelButtonColor: "#64748b",
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.clear();
          window.location.href = "index.html";
        }
      });
    });
  }
};

// Llamar al cargar la página
initUserDropdown();
