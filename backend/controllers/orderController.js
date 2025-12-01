// backend/controllers/orderController.js

const { pool } = require("../config/database");
const { generateOrderPDF } = require("../utils/pdfGenerator");
const { sendOrderEmail } = require("../utils/emailSender");
const fs = require("fs");

// ============================================
// CREAR ORDEN
// ============================================
const createOrder = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const usuario_id = req.user.id;
    const {
      direccion,
      ciudad,
      codigoPostal,
      pais,
      telefono,
      metodoPago,
      codigoCupon,
    } = req.body;

    // Validaciones básicas
    if (!direccion || !ciudad || !pais || !metodoPago) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "Faltan datos obligatorios",
      });
    }

    // ============================================
    // 1. OBTENER CARRITO DEL USUARIO
    // ============================================
    const [cartItems] = await connection.query(
      `SELECT c.*, p.nombre, p.precio, p.stock 
             FROM carrito c
             JOIN productos p ON c.producto_id = p.id
             WHERE c.usuario_id = ?`,
      [usuario_id]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: "El carrito está vacío",
      });
    }

    // ============================================
    // 2. VERIFICAR STOCK
    // ============================================
    for (const item of cartItems) {
      if (item.stock < item.cantidad) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Stock insuficiente para ${item.nombre}`,
        });
      }
    }

    // ============================================
    // 3. CALCULAR SUBTOTAL
    // ============================================
    let subtotal = 0;
    cartItems.forEach((item) => {
      subtotal += parseFloat(item.precio) * item.cantidad;
    });

    // ============================================
    // 4. CALCULAR IMPUESTOS Y ENVÍO SEGÚN PAÍS
    // ============================================
    let tasaImpuesto = 0;
    let costoEnvio = 0;

    // Puedes ajustar esto según el país
    switch (pais.toLowerCase()) {
      case "mexico":
      case "méxico":
        tasaImpuesto = 0.16; // 16% IVA
        costoEnvio = 10.0;
        break;
      case "usa":
      case "estados unidos":
        tasaImpuesto = 0.08; // 8% aprox
        costoEnvio = 15.0;
        break;
      default:
        tasaImpuesto = 0.1;
        costoEnvio = 20.0;
    }

    const impuestos = subtotal * tasaImpuesto;
    const envio = costoEnvio;

    // ============================================
    // 5. APLICAR CUPÓN (si existe)
    // ============================================
    let descuento = 0;
    let cuponAplicado = null;

    if (codigoCupon) {
      const [cupones] = await connection.query(
        "SELECT * FROM cupones WHERE codigo = ? AND activo = true",
        [codigoCupon]
      );

      if (cupones.length > 0) {
        const cupon = cupones[0];
        descuento = subtotal * (parseFloat(cupon.descuento) / 100);
        cuponAplicado = cupon.codigo;
      }
    }

    // ============================================
    // 6. CALCULAR TOTAL
    // ============================================
    const total = subtotal + impuestos + envio - descuento;

    // ============================================
    // 7. CREAR ORDEN EN LA BD
    // ============================================
    const [orderResult] = await connection.query(
      `INSERT INTO ordenes 
             (usuario_id, subtotal, impuestos, envio, descuento, total, pais, direccion, metodo_pago) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        usuario_id,
        subtotal,
        impuestos,
        envio,
        descuento,
        total,
        pais,
        `${direccion}, ${ciudad}, CP: ${codigoPostal}`,
        metodoPago,
      ]
    );

    const ordenId = orderResult.insertId;

    // ============================================
    // 8. GUARDAR DETALLE DE LA ORDEN
    // ============================================
    for (const item of cartItems) {
      await connection.query(
        "INSERT INTO orden_detalle (orden_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
        [ordenId, item.producto_id, item.cantidad, item.precio]
      );
    }

    // ============================================
    // 9. ACTUALIZAR INVENTARIO (restar stock)
    // ============================================
    for (const item of cartItems) {
      await connection.query(
        "UPDATE productos SET stock = stock - ? WHERE id = ?",
        [item.cantidad, item.producto_id]
      );
    }

    // ============================================
    // 10. VACIAR CARRITO
    // ============================================
    await connection.query("DELETE FROM carrito WHERE usuario_id = ?", [
      usuario_id,
    ]);

    await connection.commit();

    // ============================================
    // 11. OBTENER INFO DEL USUARIO
    // ============================================
    const [usuario] = await connection.query(
      "SELECT nombre, email FROM usuarios WHERE id = ?",
      [usuario_id]
    );

    // ============================================
    // 12. GENERAR PDF
    // ============================================
    const fecha = new Date().toLocaleDateString("es-MX");
    const hora = new Date().toLocaleTimeString("es-MX");

    const pdfData = {
      ordenId,
      fecha,
      hora,
      cliente: {
        nombre: usuario[0].nombre,
        email: usuario[0].email,
      },
      direccion: {
        direccion,
        ciudad,
        codigoPostal,
        pais,
      },
      productos: cartItems.map((item) => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.precio,
      })),
      subtotal,
      impuestos,
      envio,
      descuento,
      total,
    };

    const pdfPath = await generateOrderPDF(pdfData);

    // ============================================
    // 13. ENVIAR EMAIL CON PDF
    // ============================================
    await sendOrderEmail(
      usuario[0].email,
      `Orden #${ordenId} - TechStore`,
      pdfData,
      pdfPath
    );

    // ============================================
    // 14. ELIMINAR PDF TEMPORAL (opcional)
    // ============================================
    setTimeout(() => {
      fs.unlinkSync(pdfPath);
      console.log("PDF temporal eliminado");
    }, 10000); // Eliminar después de 10 segundos

    // ============================================
    // 15. RESPONDER AL CLIENTE
    // ============================================
    res.json({
      success: true,
      message: "Compra realizada exitosamente",
      ordenId,
      total: total.toFixed(2),
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error en createOrder:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar la orden",
      error: error.message,
    });
  } finally {
    connection.release();
  }
};

module.exports = {
  createOrder,
};
