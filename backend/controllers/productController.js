// backend/controllers/productController.js

const { pool } = require("../config/database");

// ============================================
// OBTENER TODOS LOS PRODUCTOS (con filtros)
// ============================================
const getAllProducts = async (req, res) => {
  try {
    const { categoria_id, precio_min, precio_max, en_oferta } = req.query;

    let query = `
            SELECT p.*, c.nombre as categoria_nombre 
            FROM productos p 
            JOIN categorias c ON p.categoria_id = c.id
            WHERE 1=1
        `;
    const params = [];

    // Filtro por categoría
    if (categoria_id) {
      query += " AND p.categoria_id = ?";
      params.push(categoria_id);
    }

    // Filtro por precio mínimo
    if (precio_min) {
      query += " AND p.precio >= ?";
      params.push(precio_min);
    }

    // Filtro por precio máximo
    if (precio_max) {
      query += " AND p.precio <= ?";
      params.push(precio_max);
    }

    // Filtro por productos en oferta
    if (en_oferta === "true") {
      query += " AND p.en_oferta = true";
    }

    query += " ORDER BY p.id DESC";

    const [productos] = await pool.query(query, params);

    res.json({
      success: true,
      total: productos.length,
      productos,
    });
  } catch (error) {
    console.error("Error en getAllProducts:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos",
      error: error.message,
    });
  }
};

// ============================================
// OBTENER PRODUCTOS POR CATEGORÍA
// ============================================
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const [productos] = await pool.query(
      `SELECT p.*, c.nombre as categoria_nombre 
             FROM productos p 
             JOIN categorias c ON p.categoria_id = c.id
             WHERE p.categoria_id = ?
             ORDER BY p.id DESC`,
      [categoryId]
    );

    res.json({
      success: true,
      total: productos.length,
      productos,
    });
  } catch (error) {
    console.error("Error en getProductsByCategory:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos",
      error: error.message,
    });
  }
};

// ============================================
// OBTENER UN PRODUCTO POR ID
// ============================================
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const [productos] = await pool.query(
      `SELECT p.*, c.nombre as categoria_nombre 
             FROM productos p 
             JOIN categorias c ON p.categoria_id = c.id
             WHERE p.id = ?`,
      [id]
    );

    if (productos.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    res.json({
      success: true,
      producto: productos[0],
    });
  } catch (error) {
    console.error("Error en getProductById:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener producto",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductsByCategory,
  getProductById,
};
