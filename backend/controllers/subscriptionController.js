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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0e27; color: #e0e7ff; border-radius: 12px; overflow: hidden;">
        
        <!-- HEADER CON LOGO -->
        <div style="background: linear-gradient(135deg, #00d4ff, #b537f2); padding: 2rem; text-align: center;">
            <img src="https://res.cloudinary.com/dg2hxfe8i/image/upload/v1764878695/processor_e1t5jt.png" 
                 alt="TechStore Logo" 
                 style="width: 80px; height: 80px; margin-bottom: 1rem;">
            <h1 style="color: white; margin: 0; font-size: 2rem;">TechStore</h1>
            <p style="color: white; margin: 0.5rem 0 0 0;">Potencia tu PC</p>
        </div>

        <!-- CONTENIDO -->
        <div style="padding: 2rem;">
            <h2 style="color: #00d4ff;">¡Gracias por suscribirte!</h2>
            
            <p style="color: #e0e7ff; line-height: 1.6;">
                Usa este cupón en tu próxima compra:
            </p>

            <div style="background: #1a2038; border: 2px solid #00d4ff; border-radius: 8px; padding: 1.5rem; text-align: center; margin: 1.5rem 0;">
                <span style="font-size: 2rem; font-weight: bold; color: #00d4ff; letter-spacing: 2px;">
                    BIENVENIDO10
                </span>
            </div>

            <p style="color: #888; text-align: center; margin: 0;">
                10% de descuento en tu primera compra
            </p>
        </div>

        <!-- FOOTER -->
        <div style="background: #151b3d; padding: 1.5rem; text-align: center;">
            <p style="color: #666; font-size: 12px; margin: 0;">
                © 2025 TechStore | Proyecto Académico
            </p>
        </div>
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
