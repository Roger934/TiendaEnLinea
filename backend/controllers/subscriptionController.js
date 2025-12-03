// backend/controllers/subscriptionController.js

const { pool } = require("../config/database");
const { sendSimpleEmail } = require("../utils/emailSender");

// ============================================
// SUSCRIBIRSE
// ============================================
const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    // Validar email
    if (!email || !email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Email inválido",
      });
    }

    // Verificar si ya está suscrito
    const [existing] = await pool.query(
      "SELECT id FROM suscripciones WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Este email ya está suscrito",
      });
    }

    // Insertar suscripción
    await pool.query("INSERT INTO suscripciones (email) VALUES (?)", [email]);

    // ============================================
    // ENVIAR EMAIL DE BIENVENIDA CON CUPÓN
    // ============================================
    const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333; margin: 0;">TechStore</h1>
                    <p style="color: #666; margin: 5px 0;">Potencia tu PC</p>
                </div>

                <h2 style="color: #333;">¡Bienvenido a TechStore! 🎉</h2>
                
                <p style="color: #555; line-height: 1.6;">
                    ¡Hola!
                </p>
                
                <p style="color: #555; line-height: 1.6;">
                    Gracias por suscribirte a TechStore. Estamos emocionados de tenerte con nosotros.
                </p>
                
                <p style="color: #555; line-height: 1.6;">
                    Como agradecimiento, aquí está tu cupón de bienvenida:
                </p>

                <div style="background-color: #f5f5f5; border: 2px dashed #333; padding: 20px; text-align: center; margin: 30px 0;">
                    <p style="margin: 0; font-size: 14px; color: #666;">CÓDIGO DE DESCUENTO</p>
                    <p style="margin: 10px 0; font-size: 32px; font-weight: bold; color: #333; letter-spacing: 3px;">NUEVO2025</p>
                    <p style="margin: 0; font-size: 18px; color: #333;">15% de descuento</p>
                    <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Válido en tu primera compra</p>
                </div>

                <p style="color: #555; line-height: 1.6;">
                    Visita nuestra tienda y encuentra los mejores componentes para tu PC: procesadores, memorias RAM y tarjetas gráficas de última generación.
                </p>

                <div style="text-align: center; margin: 40px 0;">
                    <p style="color: #666; margin: 0;">
                        <strong>TechStore</strong><br>
                        Potencia tu PC
                    </p>
                </div>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

                <p style="color: #999; font-size: 12px; text-align: center;">
                    Este es un correo automático de TechStore | Proyecto Académico 2025
                </p>
            </div>
        `;

    await sendSimpleEmail(email, "¡Bienvenido a TechStore! 🎉", htmlContent);

    res.json({
      success: true,
      message:
        "Suscripción exitosa. Revisa tu correo para obtener tu cupón de descuento.",
    });
  } catch (error) {
    console.error("Error en subscribe:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar suscripción",
      error: error.message,
    });
  }
};

module.exports = {
  subscribe,
};
