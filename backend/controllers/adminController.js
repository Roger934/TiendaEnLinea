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

    if (!nombre || !descripcion || !precio || !stock || !categoria_id) {
      return res.status(400).json({
        success: false,
        message: "Faltan campos obligatorios",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, imagen_url, stock, categoria_id, en_oferta, activo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
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

    return res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      productId: result.insertId,
    });
  } catch (error) {
    console.error("Error en createProduct:", error);
    return res.status(500).json({
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

    const [existing] = await pool.query(
      "SELECT id FROM productos WHERE id = ? AND activo = 1",
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

    return res.json({
      success: true,
      message: "Producto actualizado exitosamente",
    });
  } catch (error) {
    console.error("Error en updateProduct:", error);
    return res.status(500).json({
      success: false,
      message: "Error al actualizar producto",
      error: error.message,
    });
  }
};

// ============================================
// DAR DE BAJA PRODUCTO (soft delete)
// ============================================
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

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

    // Soft delete
    await pool.query("UPDATE productos SET activo = 0 WHERE id = ?", [id]);

    return res.json({
      success: true,
      message: "Producto dado de baja exitosamente",
    });
  } catch (error) {
    console.error("Error en deleteProduct:", error);

    return res.status(500).json({
      success: false,
      message: "Error al dar de baja el producto",
      error: error.message,
    });
  }
};

// ============================================
// EXPORTAR CONTROLADOR
// ============================================
module.exports = {
  createProduct,
  updateProduct,
  deleteProduct,
};
