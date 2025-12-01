// backend/utils/emailSender.js

const nodemailer = require("nodemailer");
require("dotenv").config();

// Configurar transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ============================================
// ENVIAR EMAIL CON PDF ADJUNTO
// ============================================
const sendOrderEmail = async (to, subject, orderData, pdfPath) => {
  try {
    const htmlContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">¡Gracias por tu compra!</h1>
                
                <p>Hola <strong>${orderData.cliente.nombre}</strong>,</p>
                
                <p>Tu orden <strong>#${
                  orderData.ordenId
                }</strong> ha sido procesada exitosamente.</p>
                
                <h2 style="color: #555;">Resumen de tu compra:</h2>
                
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="background-color: #f5f5f5;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Subtotal</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">$${parseFloat(
                          orderData.subtotal
                        ).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Impuestos</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">$${parseFloat(
                          orderData.impuestos
                        ).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Envío</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">$${parseFloat(
                          orderData.envio
                        ).toFixed(2)}</td>
                    </tr>
                    ${
                      orderData.descuento > 0
                        ? `
                    <tr>
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>Descuento</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right; color: green;">-$${parseFloat(
                          orderData.descuento
                        ).toFixed(2)}</td>
                    </tr>
                    `
                        : ""
                    }
                    <tr style="background-color: #333; color: white;">
                        <td style="padding: 10px; border: 1px solid #ddd;"><strong>TOTAL</strong></td>
                        <td style="padding: 10px; border: 1px solid #ddd; text-align: right;"><strong>$${parseFloat(
                          orderData.total
                        ).toFixed(2)}</strong></td>
                    </tr>
                </table>
                
                <p style="margin-top: 20px;">Encuentra adjunta tu nota de compra en formato PDF.</p>
                
                <p style="margin-top: 30px; color: #666;">
                    <strong>TechStore</strong><br>
                    Potencia tu PC
                </p>
            </div>
        `;

    const mailOptions = {
      from: `"TechStore" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
      attachments: [
        {
          filename: `Orden_${orderData.ordenId}.pdf`,
          path: pdfPath,
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email enviado:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error al enviar email:", error);
    throw error;
  }
};

// ============================================
// ENVIAR EMAIL SIMPLE (sin adjuntos)
// ============================================
const sendSimpleEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `"TechStore" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email enviado:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error al enviar email:", error);
    throw error;
  }
};

module.exports = {
  sendOrderEmail,
  sendSimpleEmail,
};
