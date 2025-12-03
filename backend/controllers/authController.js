// backend/controllers/authController.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { pool } = require("../config/database");
const svgCaptcha = require("svg-captcha"); // Captcha
const crypto = require("crypto"); // Encriptar Contra olvida
const { sendSimpleEmail } = require("../utils/emailSender"); // Enviar email para contraseña olvidada

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
    const { email, password, captchaText, captchaToken } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son obligatorios",
      });
    }

    // ============================================
    // VALIDAR CAPTCHA
    // ============================================
    if (!captchaText || !captchaToken) {
      return res.status(400).json({
        success: false,
        message: "Captcha es obligatorio",
      });
    }

    // Decodificar el token del captcha
    const captchaOriginal = Buffer.from(captchaToken, "base64").toString(
      "utf-8"
    );

    if (captchaText.toLowerCase() !== captchaOriginal.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "Captcha incorrecto",
      });
    }

    // ============================================
    // BUSCAR USUARIO
    // ============================================
    const [users] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    const user = users[0];

    // ============================================
    // VERIFICAR BLOQUEO
    // ============================================
    if (user.bloqueado_hasta) {
      const now = new Date();
      const bloqueadoHasta = new Date(user.bloqueado_hasta);

      if (now < bloqueadoHasta) {
        const minutosRestantes = Math.ceil((bloqueadoHasta - now) / 60000);
        return res.status(403).json({
          success: false,
          message: `Cuenta bloqueada. Intenta de nuevo en ${minutosRestantes} minuto(s)`,
        });
      } else {
        // Desbloquear cuenta
        await pool.query(
          "UPDATE usuarios SET bloqueado_hasta = NULL, intentos_fallidos = 0 WHERE id = ?",
          [user.id]
        );
      }
    }

    // ============================================
    // VERIFICAR CONTRASEÑA
    // ============================================
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      // Incrementar intentos fallidos
      const nuevoIntentos = user.intentos_fallidos + 1;

      if (nuevoIntentos >= 3) {
        // Bloquear por 5 minutos
        const bloqueadoHasta = new Date(Date.now() + 5 * 60 * 1000);
        await pool.query(
          "UPDATE usuarios SET intentos_fallidos = ?, bloqueado_hasta = ? WHERE id = ?",
          [nuevoIntentos, bloqueadoHasta, user.id]
        );

        return res.status(403).json({
          success: false,
          message:
            "Cuenta bloqueada por 5 minutos debido a múltiples intentos fallidos",
        });
      } else {
        await pool.query(
          "UPDATE usuarios SET intentos_fallidos = ? WHERE id = ?",
          [nuevoIntentos, user.id]
        );

        return res.status(401).json({
          success: false,
          message: `Credenciales inválidas. Intento ${nuevoIntentos} de 3`,
        });
      }
    }

    // ============================================
    // LOGIN EXITOSO
    // ============================================
    // Resetear intentos fallidos
    await pool.query(
      "UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?",
      [user.id]
    );

    // Generar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
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

// ============================================
// GENERAR CAPTCHA
// ============================================
const generateCaptcha = async (req, res) => {
  try {
    // Generar captcha
    const captcha = svgCaptcha.create({
      size: 6, // 6 caracteres
      noise: 2, // Líneas de ruido
      color: true, // Colores
      background: "#f0f0f0",
    });

    // Guardar el texto del captcha en la sesión o retornarlo encriptado
    // Por simplicidad, lo retornamos encriptado
    const captchaToken = Buffer.from(captcha.text).toString("base64");

    res.json({
      success: true,
      captchaSvg: captcha.data, // SVG de la imagen
      captchaToken: captchaToken, // Token para validar después
    });
  } catch (error) {
    console.error("Error en generateCaptcha:", error);
    res.status(500).json({
      success: false,
      message: "Error al generar captcha",
      error: error.message,
    });
  }
};

// ============================================
// SOLICITAR RECUPERACIÓN DE CONTRASEÑA
// ============================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email es obligatorio",
      });
    }

    // Buscar usuario
    const [users] = await pool.query(
      "SELECT id, nombre, email FROM usuarios WHERE email = ?",
      [email]
    );

    // Por seguridad, siempre respondemos igual (aunque el email no exista)
    if (users.length === 0) {
      return res.json({
        success: true,
        message: "Si el email existe, recibirás un correo con instrucciones",
      });
    }

    const user = users[0];

    // Generar token único
    const token = crypto.randomBytes(32).toString("hex");

    // Token expira en 1 hora
    const expiraEn = new Date(Date.now() + 60 * 60 * 1000);

    // Guardar token en BD
    await pool.query(
      "INSERT INTO password_reset_tokens (usuario_id, token, expira_en) VALUES (?, ?, ?)",
      [user.id, token, expiraEn]
    );

    // Construir URL de reset (HARDCODEADO)
    const resetUrl = `http://localhost:5500/frontend/reset-password.html?token=${token}`;

    // Enviar email
    const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333; margin: 0;">TechStore</h1>
                    <p style="color: #666; margin: 5px 0;">Potencia tu PC</p>
                </div>

                <h2 style="color: #333;">Recuperación de Contraseña</h2>
                
                <p style="color: #555; line-height: 1.6;">
                    Hola <strong>${user.nombre}</strong>,
                </p>
                
                <p style="color: #555; line-height: 1.6;">
                    Recibimos una solicitud para restablecer tu contraseña en TechStore.
                </p>

                <p style="color: #555; line-height: 1.6;">
                    Haz click en el siguiente botón para crear una nueva contraseña:
                </p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" 
                       style="background-color: #333; color: white; padding: 15px 30px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Restablecer Contraseña
                    </a>
                </div>

                <p style="color: #555; line-height: 1.6; font-size: 14px;">
                    O copia y pega este enlace en tu navegador:
                </p>
                <p style="color: #0066cc; word-break: break-all; font-size: 12px;">
                    ${resetUrl}
                </p>

                <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px;">
                    <p style="margin: 0; color: #856404; font-size: 14px;">
                        ⚠️ <strong>Importante:</strong> Este enlace expira en 1 hora.
                    </p>
                </div>

                <p style="color: #555; line-height: 1.6;">
                    Si no solicitaste este cambio, puedes ignorar este correo.
                </p>

                <div style="text-align: center; margin: 40px 0;">
                    <p style="color: #666; margin: 0;">
                        <strong>TechStore</strong><br>
                        Potencia tu PC
                    </p>
                </div>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

                <p style="color: #999; font-size: 12px; text-align: center;">
                    TechStore | Proyecto Académico 2025
                </p>
            </div>
        `;

    await sendSimpleEmail(
      user.email,
      "Recuperación de Contraseña - TechStore",
      htmlContent
    );

    res.json({
      success: true,
      message: "Si el email existe, recibirás un correo con instrucciones",
    });
  } catch (error) {
    console.error("Error en forgotPassword:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar solicitud",
      error: error.message,
    });
  }
};

// ============================================
// RESTABLECER CONTRASEÑA
// ============================================
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    console.log("🔍 Token recibido:", token); // LOG 1

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token y nueva contraseña son obligatorios",
      });
    }

    if (newPassword.length < 3) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 3 caracteres",
      });
    }

    // Buscar token válido
    const [tokens] = await pool.query(
      `SELECT * FROM password_reset_tokens 
     WHERE token = ? AND usado = 0`,
      [token]
    );

    console.log("🔍 Tokens encontrados:", tokens.length);
    if (tokens.length > 0) {
      console.log("🔍 Token encontrado:", tokens[0]);

      // Verificar manualmente si expiró
      const now = new Date();
      const expiraEn = new Date(tokens[0].expira_en);
      console.log("⏰ Ahora:", now);
      console.log("⏰ Expira:", expiraEn);

      if (now > expiraEn) {
        console.log("⏰ Token expirado");
        return res.status(400).json({
          success: false,
          message: "Token expirado",
        });
      }
    }

    const resetToken = tokens[0];

    // Cifrar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await pool.query("UPDATE usuarios SET password = ? WHERE id = ?", [
      hashedPassword,
      resetToken.usuario_id,
    ]);

    // Marcar token como usado
    await pool.query(
      "UPDATE password_reset_tokens SET usado = true WHERE id = ?",
      [resetToken.id]
    );

    res.json({
      success: true,
      message: "Contraseña actualizada exitosamente",
    });
  } catch (error) {
    console.error("Error en resetPassword:", error);
    res.status(500).json({
      success: false,
      message: "Error al restablecer contraseña",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
  verify,
  logout,
  generateCaptcha,
  forgotPassword,
  resetPassword,
};
