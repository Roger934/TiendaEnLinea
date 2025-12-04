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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0e27; color: #e0e7ff; border-radius: 12px; overflow: hidden;">
        
        <!-- HEADER CON LOGO -->
        <div style="background: linear-gradient(135deg, #00d4ff, #b537f2); padding: 2rem; text-align: center;">
            <img src="https://res.cloudinary.com/dg2hxfe8i/image/upload/v1764878695/processor_e1t5jt.png" 
                 alt="TechStore Logo" 
                 style="width: 80px; height: 80px; margin-bottom: 1rem;">
            <h1 style="color: white; margin: 0; font-size: 2rem;">TechStore</h1>
            <p style="color: white; margin: 0.5rem 0 0 0; font-size: 1rem;">Potencia tu PC</p>
        </div>

        <!-- CONTENIDO -->
        <div style="padding: 2rem;">
            <h2 style="color: #00d4ff; margin-top: 0;">Gracias por contactarnos</h2>
            
            <p style="color: #e0e7ff; line-height: 1.6;">
                Hola <strong style="color: #00d4ff;">${nombre}</strong>,
            </p>
            
            <p style="color: #e0e7ff; line-height: 1.6;">
                Hemos recibido tu mensaje y en breve será atendido por nuestro equipo.
            </p>

            <div style="background-color: #1a2038; padding: 1.5rem; margin: 1.5rem 0; border-left: 4px solid #00d4ff; border-radius: 8px;">
                <p style="margin: 0; color: #888; font-size: 14px;"><strong>Tu mensaje:</strong></p>
                <p style="margin: 10px 0 0 0; color: #e0e7ff; line-height: 1.6;">${mensaje}</p>
            </div>

            <p style="color: #e0e7ff; line-height: 1.6;">
                Nos pondremos en contacto contigo lo antes posible.
            </p>
        </div>

        <!-- FOOTER -->
        <div style="background: #151b3d; padding: 1.5rem; text-align: center;">
            <p style="color: #888; margin: 0; font-size: 0.9rem;">
                <strong style="color: #00d4ff;">TechStore</strong><br>
                Potencia tu PC
            </p>
            <p style="color: #666; font-size: 12px; margin: 1rem 0 0 0;">
                Este es un correo automático. Por favor no respondas a este mensaje.<br>
                TechStore | Proyecto Académico 2025
            </p>
        </div>
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
