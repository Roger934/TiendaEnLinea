// backend/utils/pdfGenerator.js

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateOrderPDF = (orderData) => {
  return new Promise((resolve, reject) => {
    try {
      // Crear directorio temporal si no existe
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
      }

      const fileName = `orden_${orderData.ordenId}_${Date.now()}.pdf`;
      const filePath = path.join(tempDir, fileName);

      // Crear documento PDF
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // ============================================
      // ENCABEZADO
      // ============================================
      doc.fontSize(20).text("TechStore", { align: "center" });
      doc.fontSize(12).text("Tienda de Componentes de PC", { align: "center" });
      doc.moveDown();

      doc
        .fontSize(16)
        .text("NOTA DE COMPRA", { align: "center", underline: true });
      doc.moveDown();

      // ============================================
      // INFO DE LA ORDEN
      // ============================================
      doc.fontSize(10);
      doc.text(`Orden #: ${orderData.ordenId}`);
      doc.text(`Fecha: ${orderData.fecha}`);
      doc.text(`Hora: ${orderData.hora}`);
      doc.moveDown();

      // ============================================
      // INFO DEL CLIENTE
      // ============================================
      doc.fontSize(12).text("DATOS DEL CLIENTE", { underline: true });
      doc.fontSize(10);
      doc.text(`Nombre: ${orderData.cliente.nombre}`);
      doc.text(`Email: ${orderData.cliente.email}`);
      doc.text(`Dirección: ${orderData.direccion.direccion}`);
      doc.text(`Ciudad: ${orderData.direccion.ciudad}`);
      doc.text(`País: ${orderData.direccion.pais}`);
      doc.text(`Código Postal: ${orderData.direccion.codigoPostal}`);
      doc.moveDown();

      // ============================================
      // PRODUCTOS
      // ============================================
      doc.fontSize(12).text("PRODUCTOS", { underline: true });
      doc.moveDown(0.5);

      // Tabla de productos
      const tableTop = doc.y;
      const tableHeaders = ["Producto", "Cantidad", "Precio Unit.", "Subtotal"];
      const colWidths = [250, 80, 100, 100];
      let xPos = 50;

      // Headers
      doc.fontSize(10).fillColor("#000000");
      tableHeaders.forEach((header, i) => {
        doc.text(header, xPos, tableTop, {
          width: colWidths[i],
          align: i === 0 ? "left" : "right",
        });
        xPos += colWidths[i];
      });

      doc
        .moveTo(50, tableTop + 15)
        .lineTo(530, tableTop + 15)
        .stroke();
      doc.moveDown();

      // Productos
      orderData.productos.forEach((producto) => {
        const y = doc.y;
        doc.text(producto.nombre, 50, y, { width: 250 });
        doc.text(producto.cantidad.toString(), 300, y, {
          width: 80,
          align: "right",
        });
        doc.text(`$${parseFloat(producto.precioUnitario).toFixed(2)}`, 380, y, {
          width: 100,
          align: "right",
        });
        doc.text(
          `$${(producto.cantidad * parseFloat(producto.precioUnitario)).toFixed(
            2
          )}`,
          480,
          y,
          { width: 100, align: "right" }
        );
        doc.moveDown();
      });

      doc.moveTo(50, doc.y).lineTo(530, doc.y).stroke();
      doc.moveDown();

      // ============================================
      // TOTALES
      // ============================================
      const totalsX = 380;
      doc.fontSize(10);

      doc.text("Subtotal:", totalsX, doc.y);
      doc.text(`$${parseFloat(orderData.subtotal).toFixed(2)}`, 480, doc.y, {
        width: 100,
        align: "right",
      });
      doc.moveDown(0.5);

      doc.text("Impuestos:", totalsX, doc.y);
      doc.text(`$${parseFloat(orderData.impuestos).toFixed(2)}`, 480, doc.y, {
        width: 100,
        align: "right",
      });
      doc.moveDown(0.5);

      doc.text("Envío:", totalsX, doc.y);
      doc.text(`$${parseFloat(orderData.envio).toFixed(2)}`, 480, doc.y, {
        width: 100,
        align: "right",
      });
      doc.moveDown(0.5);

      if (orderData.descuento > 0) {
        doc.text("Descuento:", totalsX, doc.y);
        doc.text(
          `-$${parseFloat(orderData.descuento).toFixed(2)}`,
          480,
          doc.y,
          { width: 100, align: "right" }
        );
        doc.moveDown(0.5);
      }

      doc.moveTo(380, doc.y).lineTo(580, doc.y).stroke();
      doc.moveDown(0.5);

      doc.fontSize(12).fillColor("#000000");
      doc.text("TOTAL:", totalsX, doc.y, { bold: true });
      doc.text(`$${parseFloat(orderData.total).toFixed(2)}`, 480, doc.y, {
        width: 100,
        align: "right",
        bold: true,
      });

      doc.moveDown(2);

      // ============================================
      // PIE DE PÁGINA
      // ============================================
      doc.fontSize(10).fillColor("#666666");
      doc.text("Gracias por tu compra", { align: "center" });
      doc.text("TechStore - Potencia tu PC", { align: "center" });

      // Finalizar PDF
      doc.end();

      stream.on("finish", () => {
        resolve(filePath);
      });

      stream.on("error", (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateOrderPDF };
