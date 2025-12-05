// backend/controllers/adminController.js

const { pool } = require("../config/database");

// ============================================
// CREAR PRODUCTO
// ============================================
const createProduct = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      imagen_url,
      stock,
      categoria_id,
      en_oferta,
    } = req.body;

    // Validaciones básicas
    if (!nombre || !descripcion || !precio || !stock || !categoria_id) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos obligatorios",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, imagen_url, stock, categoria_id, en_oferta) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        descripcion,
        precio,
        imagen_url || "/images/default.jpg",
        stock,
        categoria_id,
        en_oferta || false,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      productId: result.insertId,
    });
  } catch (error) {
    console.error("Error en createProduct:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear producto",
      error: error.message,
    });
  }
};

// ============================================
// ACTUALIZAR PRODUCTO
// ============================================
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      precio,
      imagen_url,
      stock,
      categoria_id,
      en_oferta,
    } = req.body;

    // Verificar que el producto existe
    const [existing] = await pool.query(
      "SELECT id FROM productos WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    await pool.query(
      `UPDATE productos 
             SET nombre = ?, descripcion = ?, precio = ?, imagen_url = ?, stock = ?, categoria_id = ?, en_oferta = ?
             WHERE id = ?`,
      [
        nombre,
        descripcion,
        precio,
        imagen_url,
        stock,
        categoria_id,
        en_oferta,
        id,
      ]
    );

    res.json({
      success: true,
      message: "Producto actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error en updateProduct:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar producto",
      error: error.message,
    });
  }
};

// ============================================
// ELIMINAR PRODUCTO
// ============================================
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el producto existe
    const [existing] = await pool.query(
      "SELECT id FROM productos WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    // SOFT DELETE – Dar de baja sin eliminar físicamente
    await pool.query("UPDATE productos SET activo = 0 WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Producto dado de baja exitosamente",
    });

    res.json({
      success: true,
      message: "Producto eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error en deleteProduct:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar producto",
      error: error.message,
    });
  }
};

// ============================================
// OBTENER TOTAL DE VENTAS
// ============================================
const getTotalSales = async (req, res) => {
  try {
    const [result] = await pool.query(
      "SELECT SUM(total) as total_ventas, COUNT(*) as num_ordenes FROM ordenes"
    );

    res.json({
      success: true,
      totalVentas: result[0].total_ventas || 0,
      numeroOrdenes: result[0].num_ordenes || 0,
    });
  } catch (error) {
    console.error("Error en getTotalSales:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener ventas",
      error: error.message,
    });
  }
};

// ============================================
// OBTENER DATOS PARA GRÁFICA (ventas por categoría)
// ============================================
const getSalesChart = async (req, res) => {
  try {
    const [result] = await pool.query(
      `SELECT c.nombre as categoria, COUNT(od.id) as total_vendidos, SUM(od.precio_unitario * od.cantidad) as total_ventas
             FROM orden_detalle od
             JOIN productos p ON od.producto_id = p.id
             JOIN categorias c ON p.categoria_id = c.id
             GROUP BY c.id, c.nombre
             ORDER BY total_ventas DESC`
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error en getSalesChart:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener datos de gráfica",
      error: error.message,
    });
  }
};

// ============================================
// OBTENER INVENTARIO POR CATEGORÍA
// ============================================
const getInventory = async (req, res) => {
  try {
    const [result] = await pool.query(
      `SELECT c.nombre as categoria, p.nombre as producto, p.stock
             FROM productos p
             JOIN categorias c ON p.categoria_id = c.id
             ORDER BY c.id, p.nombre`
    );

    // Agrupar por categoría
    const inventario = {};
    result.forEach((item) => {
      if (!inventario[item.categoria]) {
        inventario[item.categoria] = [];
      }
      inventario[item.categoria].push({
        producto: item.producto,
        stock: item.stock,
      });
    });

    res.json({
      success: true,
      inventario,
    });
  } catch (error) {
    console.error("Error en getInventory:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener inventario",
      error: error.message,
    });
  }
};

// ============================================
// SUBIR IMAGEN A CLOUDINARY
// ============================================
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se recibió ninguna imagen",
      });
    }

    // Cloudinary ya subió la imagen automáticamente
    // req.file.path contiene la URL de Cloudinary

    res.json({
      success: true,
      message: "Imagen subida exitosamente",
      imageUrl: req.file.path,
      publicId: req.file.filename,
    });
  } catch (error) {
    console.error("Error en uploadImage:", error);
    res.status(500).json({
      success: false,
      message: "Error al subir imagen",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
  getTotalSales,
  getSalesChart,
  getInventory,
  uploadImage,
};
