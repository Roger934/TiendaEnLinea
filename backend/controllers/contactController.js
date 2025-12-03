// backend/controllers/contactController.js

const { sendSimpleEmail } = require("../utils/emailSender");

// ============================================
// ENVIAR MENSAJE DE CONTACTO
// ============================================
const sendContactMessage = async (req, res) => {
  try {
    const { nombre, email, mensaje } = req.body;

    // Validaciones
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son obligatorios",
      });
    }

    if (!email.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Email inválido",
      });
    }

    // ============================================
    // ENVIAR AUTO-RESPUESTA AL USUARIO
    // ============================================
    const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333; margin: 0;">TechStore</h1>
                    <p style="color: #666; margin: 5px 0;">Potencia tu PC</p>
                </div>

                <h2 style="color: #333;">Gracias por contactarnos</h2>
                
                <p style="color: #555; line-height: 1.6;">
                    Hola <strong>${nombre}</strong>,
                </p>
                
                <p style="color: #555; line-height: 1.6;">
                    Hemos recibido tu mensaje y en breve será atendido por nuestro equipo.
                </p>

                <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-left: 4px solid #333;">
                    <p style="margin: 0; color: #666; font-size: 14px;"><strong>Tu mensaje:</strong></p>
                    <p style="margin: 10px 0 0 0; color: #555;">${mensaje}</p>
                </div>

                <p style="color: #555; line-height: 1.6;">
                    Nos pondremos en contacto contigo lo antes posible.
                </p>

                <div style="text-align: center; margin: 40px 0;">
                    <p style="color: #666; margin: 0;">
                        <strong>TechStore</strong><br>
                        Potencia tu PC
                    </p>
                </div>

                <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

                <p style="color: #999; font-size: 12px; text-align: center;">
                    Este es un correo automático. Por favor no respondas a este mensaje.<br>
                    TechStore | Proyecto Académico 2025
                </p>
            </div>
        `;

    await sendSimpleEmail(
      email,
      "Hemos recibido tu mensaje - TechStore",
      htmlContent
    );

    // ============================================
    // OPCIONAL: Guardar mensaje en BD
    // ============================================
    // Puedes crear una tabla 'mensajes_contacto' si quieres guardar los mensajes
    // Por ahora solo enviamos el email

    res.json({
      success: true,
      message: "Mensaje enviado. Recibirás una confirmación en tu correo.",
    });
  } catch (error) {
    console.error("Error en sendContactMessage:", error);
    res.status(500).json({
      success: false,
      message: "Error al enviar mensaje",
      error: error.message,
    });
  }
};

module.exports = {
  sendContactMessage,
};
