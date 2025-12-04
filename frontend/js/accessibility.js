// frontend/js/accessibility.js

// ============================================
// ACCESIBILIDAD: MODO OSCURO/CLARO + TAMAÑO TEXTO
// ============================================

class AccessibilityManager {
  constructor() {
    this.init();
  }

  init() {
    // Cargar preferencias guardadas
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

    // Guardar preferencia
    localStorage.setItem("theme", newTheme);

    // Actualizar icono del botón
    this.updateThemeIcon(newTheme);

    console.log(`✅ Tema cambiado a: ${newTheme}`);
  }

  updateThemeIcon(theme) {
    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) {
      themeBtn.textContent = theme === "dark" ? "🌙" : "☀️";
      themeBtn.title = theme === "dark" ? "Modo Claro" : "Modo Oscuro";
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
      localStorage.setItem("fontSize", "normal");
      console.log("✅ Tamaño de texto: Normal");
    } else if (!body.classList.contains("font-large")) {
      // De normal a large
      body.classList.add("font-large");
      localStorage.setItem("fontSize", "large");
      console.log("✅ Tamaño de texto: Grande");
    } else {
      console.log("⚠️ Ya estás en el tamaño máximo");
    }
  }

  decreaseFont() {
    const body = document.body;

    if (body.classList.contains("font-large")) {
      // De large a normal
      body.classList.remove("font-large");
      localStorage.setItem("fontSize", "normal");
      console.log("✅ Tamaño de texto: Normal");
    } else if (!body.classList.contains("font-small")) {
      // De normal a small
      body.classList.add("font-small");
      localStorage.setItem("fontSize", "small");
      console.log("✅ Tamaño de texto: Pequeño");
    } else {
      console.log("⚠️ Ya estás en el tamaño mínimo");
    }
  }

  // ============================================
  // CARGAR PREFERENCIAS
  // ============================================
  loadPreferences() {
    this.theme = localStorage.getItem("theme") || "dark";
    this.fontSize = localStorage.getItem("fontSize") || "normal";
  }

  applyPreferences() {
    const body = document.body;

    // Aplicar tema
    if (this.theme === "light") {
      body.classList.add("light-mode");
    }
    this.updateThemeIcon(this.theme);

    // Aplicar tamaño de texto
    if (this.fontSize === "small") {
      body.classList.add("font-small");
    } else if (this.fontSize === "large") {
      body.classList.add("font-large");
    }

    console.log(
      `🎨 Preferencias cargadas: Tema ${this.theme}, Texto ${this.fontSize}`
    );
  }
}

// ============================================
// INICIALIZAR AL CARGAR LA PÁGINA
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  new AccessibilityManager();
  console.log("♿ Sistema de accesibilidad inicializado");
});
