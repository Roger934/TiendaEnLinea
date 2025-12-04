// frontend/js/accessibility.js

// ============================================
// ACCESIBILIDAD: MODO OSCURO/CLARO + TAMAÑO TEXTO
// CADA USUARIO TIENE SUS PROPIAS PREFERENCIAS
// ============================================

class AccessibilityManager {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    // Obtener usuario actual
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    this.currentUser = user.email || "guest";

    // Cargar preferencias del usuario
    this.loadPreferences();

    // Event listeners
    this.setupEventListeners();

    // Aplicar preferencias
    this.applyPreferences();
  }

  setupEventListeners() {
    // Modo oscuro/claro
    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => this.toggleTheme());
    }

    // Aumentar texto
    const increaseFontBtn = document.getElementById("increaseFontBtn");
    if (increaseFontBtn) {
      increaseFontBtn.addEventListener("click", () => this.increaseFont());
    }

    // Reducir texto
    const decreaseFontBtn = document.getElementById("decreaseFontBtn");
    if (decreaseFontBtn) {
      decreaseFontBtn.addEventListener("click", () => this.decreaseFont());
    }
  }

  // ============================================
  // OBTENER CLAVE DE PREFERENCIAS POR USUARIO
  // ============================================
  getPreferenceKey(preference) {
    return `accessibility_${this.currentUser}_${preference}`;
  }

  // ============================================
  // TEMA CLARO/OSCURO
  // ============================================
  toggleTheme() {
    const body = document.body;
    const currentTheme = body.classList.contains("light-mode")
      ? "light"
      : "dark";
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    if (newTheme === "light") {
      body.classList.add("light-mode");
    } else {
      body.classList.remove("light-mode");
    }

    // Guardar preferencia POR USUARIO
    localStorage.setItem(this.getPreferenceKey("theme"), newTheme);

    // Actualizar icono del botón
    this.updateThemeIcon(newTheme);

    console.log(`✅ [${this.currentUser}] Tema cambiado a: ${newTheme}`);
  }

  updateThemeIcon(theme) {
    const themeBtn = document.getElementById("themeToggle");
    if (!themeBtn) return;

    if (theme === "dark") {
      // 🌙 Modo oscuro → mostrar luna
      themeBtn.innerHTML = `
      <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.64 13a1 1 0 0 0-1.05-.14 8 8 0 0 1-10.45-10.5A1 1 0 0 0 9 1a10 10 0 1 0 12.64 12z"/>
      </svg>
    `;
      themeBtn.title = "Modo Claro";
    } else {
      // ☀️ Modo claro → mostrar sol con rayos (tu SVG)
      themeBtn.innerHTML = `
      <svg width="26" height="26" viewBox="0 0 30 30" fill="currentColor">
        <circle cx="15" cy="15" r="6" />
        <line id="ray" stroke="currentColor" stroke-width="2" stroke-linecap="round" x1="15" y1="1" x2="15" y2="4"></line>
        <use href="#ray" transform="rotate(45 15 15)" />
        <use href="#ray" transform="rotate(90 15 15)" />
        <use href="#ray" transform="rotate(135 15 15)" />
        <use href="#ray" transform="rotate(180 15 15)" />
        <use href="#ray" transform="rotate(225 15 15)" />
        <use href="#ray" transform="rotate(270 15 15)" />
        <use href="#ray" transform="rotate(315 15 15)" />
      </svg>
    `;
      themeBtn.title = "Modo Oscuro";
    }
  }

  // ============================================
  // TAMAÑO DE TEXTO
  // ============================================
  increaseFont() {
    const body = document.body;

    if (body.classList.contains("font-small")) {
      // De small a normal
      body.classList.remove("font-small");
      localStorage.setItem(this.getPreferenceKey("fontSize"), "normal");
      console.log(`✅ [${this.currentUser}] Tamaño de texto: Normal`);
    } else if (!body.classList.contains("font-large")) {
      // De normal a large
      body.classList.add("font-large");
      localStorage.setItem(this.getPreferenceKey("fontSize"), "large");
      console.log(`✅ [${this.currentUser}] Tamaño de texto: Grande`);
    } else {
      console.log("⚠️ Ya estás en el tamaño máximo");
    }
  }

  decreaseFont() {
    const body = document.body;

    if (body.classList.contains("font-large")) {
      // De large a normal
      body.classList.remove("font-large");
      localStorage.setItem(this.getPreferenceKey("fontSize"), "normal");
      console.log(`✅ [${this.currentUser}] Tamaño de texto: Normal`);
    } else if (!body.classList.contains("font-small")) {
      // De normal a small
      body.classList.add("font-small");
      localStorage.setItem(this.getPreferenceKey("fontSize"), "small");
      console.log(`✅ [${this.currentUser}] Tamaño de texto: Pequeño`);
    } else {
      console.log("⚠️ Ya estás en el tamaño mínimo");
    }
  }

  // ============================================
  // CARGAR PREFERENCIAS POR USUARIO
  // ============================================
  loadPreferences() {
    this.theme = localStorage.getItem(this.getPreferenceKey("theme")) || "dark";
    this.fontSize =
      localStorage.getItem(this.getPreferenceKey("fontSize")) || "normal";
  }

  applyPreferences() {
    const body = document.body;

    // Aplicar tema
    if (this.theme === "light") {
      body.classList.add("light-mode");
    } else {
      body.classList.remove("light-mode");
    }
    this.updateThemeIcon(this.theme);

    // Aplicar tamaño de texto
    body.classList.remove("font-small", "font-large"); // Limpiar primero
    if (this.fontSize === "small") {
      body.classList.add("font-small");
    } else if (this.fontSize === "large") {
      body.classList.add("font-large");
    }

    console.log(
      `🎨 [${this.currentUser}] Preferencias cargadas: Tema ${this.theme}, Texto ${this.fontSize}`
    );
  }

  // ============================================
  // GUARDAR PREFERENCIAS MANUALMENTE
  // ============================================
  savePreferences() {
    const currentTheme = document.body.classList.contains("light-mode")
      ? "light"
      : "dark";
    const currentFontSize = document.body.classList.contains("font-large")
      ? "large"
      : document.body.classList.contains("font-small")
      ? "small"
      : "normal";

    localStorage.setItem(this.getPreferenceKey("theme"), currentTheme);
    localStorage.setItem(this.getPreferenceKey("fontSize"), currentFontSize);

    console.log(
      `💾 [${this.currentUser}] Preferencias guardadas: ${currentTheme}, ${currentFontSize}`
    );
  }
}

// ============================================
// INICIALIZAR AL CARGAR LA PÁGINA
// ============================================
let accessibilityManager = null;

document.addEventListener("DOMContentLoaded", () => {
  accessibilityManager = new AccessibilityManager();
  console.log("♿ Sistema de accesibilidad inicializado");
});

// ============================================
// GUARDAR PREFERENCIAS ANTES DE SALIR
// ============================================
window.addEventListener("beforeunload", () => {
  if (accessibilityManager) {
    accessibilityManager.savePreferences();
  }
});

// ============================================
// REINICIAR CUANDO CAMBIA EL USUARIO (LOGIN/LOGOUT)
// ============================================
window.addEventListener("storage", (e) => {
  if (e.key === "user" || e.key === "token") {
    console.log("🔄 Usuario cambió, recargando preferencias...");
    if (accessibilityManager) {
      accessibilityManager.init();
    }
  }
});
