// backend/controllers/authController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");

// ============================================
// REGISTRO DE USUARIO
// ============================================
const register = async (req, res) => {
  try {
    const { nombre, email, password, password2 } = req.body;

    // Validaciones básicas
    if (!nombre || !email || !password || !password2) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios",
      });
    }

    // Verificar que las contraseñas coincidan
    if (password !== password2) {
      return res.status(400).json({
        success: false,
        message: "Las contraseñas no coinciden",
      });
    }

    // Verificar que el email no exista
    const [existingUser] = await pool.query(
      "SELECT id FROM usuarios WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El email ya está registrado",
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario en la BD
    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, hashedPassword, "usuario"]
    );

    res.status(201).json({
      success: true,
      message: "Usuario registrado exitosamente",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Error en register:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// ============================================
// LOGIN
// ============================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son obligatorios",
      });
    }

    // Buscar usuario
    const [users] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    const user = users[0];

    // Verificar si está bloqueado
    if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
      return res.status(403).json({
        success: false,
        message: "Cuenta bloqueada. Intenta más tarde.",
        bloqueado_hasta: user.bloqueado_hasta,
      });
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      // Incrementar intentos fallidos
      const nuevosIntentos = user.intentos_fallidos + 1;
      let bloqueado_hasta = null;

      // Bloquear si llega a 3 intentos
      if (nuevosIntentos >= 3) {
        bloqueado_hasta = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
      }

      await pool.query(
        "UPDATE usuarios SET intentos_fallidos = ?, bloqueado_hasta = ? WHERE id = ?",
        [nuevosIntentos, bloqueado_hasta, user.id]
      );

      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
        intentos: nuevosIntentos,
      });
    }

    // Login exitoso - Resetear intentos
    await pool.query(
      "UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?",
      [user.id]
    );

    // Generar JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      success: true,
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({
      success: false,
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// ============================================
// VERIFICAR TOKEN
// ============================================
const verify = async (req, res) => {
  // El middleware ya verificó el token
  // req.user tiene los datos del token
  res.json({
    success: true,
    message: "Token válido",
    user: req.user,
  });
};

// ============================================
// LOGOUT
// ============================================
const logout = async (req, res) => {
  // El logout se maneja en el frontend (eliminar token del localStorage)
  // Aquí solo confirmamos
  res.json({
    success: true,
    message: "Logout exitoso",
  });
};

module.exports = {
  register,
  login,
  verify,
  logout,
};
