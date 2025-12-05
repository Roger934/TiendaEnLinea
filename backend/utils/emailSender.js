// backend/utils/emailSender.js

const sgMail = require("@sendgrid/mail");
const fs = require("fs");

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ============================================
// ENVIAR EMAIL CON PDF ADJUNTO
// ============================================
const sendOrderEmail = async (to, subject, orderData, pdfPath) => {
  try {
    // Leer PDF como buffer
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfBase64 = pdfBuffer.toString("base64");

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0e27; color: #e0e7ff; border-radius: 12px; overflow: hidden;">
        
        <!-- HEADER CON LOGO -->
        <div style="background: linear-gradient(135deg, #00d4ff, #b537f2); padding: 2rem; text-align: center;">
          <img src="https://img.icons8.com/nolan/64/processor.png" 
               alt="TechStore Logo" 
               style="width: 80px; height: 80px; margin-bottom: 1rem;">
          <h1 style="color: white; margin: 0; font-size: 2rem;">TechStore</h1>
          <p style="color: white; margin: 0.5rem 0 0 0;">Potencia tu PC</p>
        </div>

        <!-- CONTENIDO -->
        <div style="padding: 2rem;">
          <h2 style="color: #00d4ff;">¡Orden Confirmada!</h2>
          
          <p style="color: #e0e7ff; line-height: 1.6;">
            Hola <strong style="color: #00d4ff;">${
              orderData.cliente.nombre
            }</strong>,
          </p>
          
          <p style="color: #e0e7ff; line-height: 1.6;">
            Tu orden <strong style="color: #00d4ff;">#${
              orderData.ordenId
            }</strong> ha sido procesada exitosamente.
          </p>

          <div style="background-color: #1a2038; padding: 1.5rem; margin: 1.5rem 0; border-radius: 8px;">
            <table style="width: 100%; color: #e0e7ff;">
              <tr>
                <td style="padding: 0.5rem 0;">Subtotal:</td>
                <td style="text-align: right;">$${parseFloat(
                  orderData.subtotal
                ).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 0.5rem 0;">Impuestos:</td>
                <td style="text-align: right;">$${parseFloat(
                  orderData.impuestos
                ).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 0.5rem 0;">Envío:</td>
                <td style="text-align: right;">$${parseFloat(
                  orderData.envio
                ).toFixed(2)}</td>
              </tr>
              ${
                orderData.descuento > 0
                  ? `
              <tr>
                <td style="padding: 0.5rem 0;">Descuento:</td>
                <td style="text-align: right; color: #00d4ff;">-$${parseFloat(
                  orderData.descuento
                ).toFixed(2)}</td>
              </tr>
              `
                  : ""
              }
              <tr style="border-top: 2px solid #00d4ff;">
                <td style="padding: 1rem 0 0 0;"><strong>TOTAL:</strong></td>
                <td style="text-align: right; padding: 1rem 0 0 0; font-size: 1.5rem; color: #00d4ff;"><strong>$${parseFloat(
                  orderData.total
                ).toFixed(2)}</strong></td>
              </tr>
            </table>
          </div>

          <p style="color: #e0e7ff; line-height: 1.6;">
            Encuentra adjunta tu nota de compra en formato PDF.
          </p>
        </div>

        <!-- FOOTER -->
        <div style="background: #151b3d; padding: 1.5rem; text-align: center;">
          <p style="color: #888; margin: 0; font-size: 0.9rem;">
            <strong style="color: #00d4ff;">TechStore</strong><br>
            Potencia tu PC
          </p>
          <p style="color: #666; font-size: 12px; margin: 1rem 0 0 0;">
            © 2025 TechStore | Proyecto Académico
          </p>
        </div>
      </div>
    `;

    const msg = {
      to: to,
      from: process.env.EMAIL_USER,
      subject: subject,
      html: htmlContent,
      attachments: [
        {
          content: pdfBase64,
          filename: `Orden_${orderData.ordenId}.pdf`,
          type: "application/pdf",
          disposition: "attachment",
        },
      ],
    };

    await sgMail.send(msg);
    console.log("✅ Email enviado a:", to);
    return { success: true };
  } catch (error) {
    console.error("❌ Error al enviar email:", error.response?.body || error);
    throw error;
  }
};

// ============================================
// ENVIAR EMAIL SIMPLE (sin adjuntos)
// ============================================
const sendSimpleEmail = async (to, subject, htmlContent) => {
  try {
    const msg = {
      to: to,
      from: process.env.EMAIL_USER,
      subject: subject,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log("✅ Email enviado a:", to);
    return { success: true };
  } catch (error) {
    console.error("❌ Error al enviar email:", error.response?.body || error);
    throw error;
  }
};

module.exports = {
  sendOrderEmail,
  sendSimpleEmail,
};
