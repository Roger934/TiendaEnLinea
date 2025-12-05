// backend/controllers/cartController.js

const { pool } = require("../config/database");

// ============================================
// AGREGAR PRODUCTO AL CARRITO
// ============================================
const addToCart = async (req, res) => {
  try {
    const { producto_id, cantidad } = req.body;
    const usuario_id = req.user.id; // Del JWT

    if (!producto_id || !cantidad) {
      return res.status(400).json({
        success: false,
        message: "Producto y cantidad son obligatorios",
      });
    }

    // Verificar que el producto existe y tiene stock
    const [producto] = await pool.query(
      "SELECT id, nombre, stock, activo FROM productos WHERE id = ?",
      [producto_id]
    );

    if (producto[0].activo === 0) {
      return res.status(400).json({
        success: false,
        message: "Este producto ya no está disponible",
      });
    }

    if (producto.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    if (producto[0].stock < cantidad) {
      return res.status(400).json({
        success: false,
        message: "Stock insuficiente",
      });
    }

    // Verificar si el producto ya está en el carrito
    const [existing] = await pool.query(
      "SELECT id, cantidad FROM carrito WHERE usuario_id = ? AND producto_id = ?",
      [usuario_id, producto_id]
    );

    if (existing.length > 0) {
      // Actualizar cantidad
      const nuevaCantidad = existing[0].cantidad + cantidad;

      if (producto[0].stock < nuevaCantidad) {
        return res.status(400).json({
          success: false,
          message: "Stock insuficiente para esta cantidad",
        });
      }

      await pool.query("UPDATE carrito SET cantidad = ? WHERE id = ?", [
        nuevaCantidad,
        existing[0].id,
      ]);

      return res.json({
        success: true,
        message: "Cantidad actualizada en el carrito",
      });
    }

    // Agregar nuevo item al carrito
    await pool.query(
      "INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)",
      [usuario_id, producto_id, cantidad]
    );

    res.json({
      success: true,
      message: "Producto agregado al carrito",
    });
  } catch (error) {
    console.error("Error en addToCart:", error);
    res.status(500).json({
      success: false,
      message: "Error al agregar al carrito",
      error: error.message,
    });
  }
};

// ============================================
// VER CARRITO DEL USUARIO
// ============================================
const getCart = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    const [items] = await pool.query(
      `SELECT c.id, c.cantidad, c.producto_id,
                    p.nombre, p.precio, p.imagen_url, p.stock
             FROM carrito c
             JOIN productos p ON c.producto_id = p.id AND p.activo = 1
             WHERE c.usuario_id = ?`,
      [usuario_id]
    );

    // Calcular subtotal
    let subtotal = 0;
    items.forEach((item) => {
      subtotal += parseFloat(item.precio) * item.cantidad;
    });

    res.json({
      success: true,
      items,
      subtotal: subtotal.toFixed(2),
      totalItems: items.length,
    });
  } catch (error) {
    console.error("Error en getCart:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener carrito",
      error: error.message,
    });
  }
};

// ============================================
// MODIFICAR CANTIDAD DE UN ITEM
// ============================================
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params; // ID del item en la tabla carrito
    const { cantidad } = req.body;
    const usuario_id = req.user.id;

    if (!cantidad || cantidad < 1) {
      return res.status(400).json({
        success: false,
        message: "Cantidad debe ser mayor a 0",
      });
    }

    // Verificar que el item pertenece al usuario
    const [item] = await pool.query(
      "SELECT producto_id FROM carrito WHERE id = ? AND usuario_id = ?",
      [id, usuario_id]
    );

    if (item.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Item no encontrado en tu carrito",
      });
    }

    // Verificar stock
    const [producto] = await pool.query(
      "SELECT stock FROM productos WHERE id = ?",
      [item[0].producto_id]
    );

    if (producto[0].stock < cantidad) {
      return res.status(400).json({
        success: false,
        message: "Stock insuficiente",
      });
    }

    // Actualizar cantidad
    await pool.query("UPDATE carrito SET cantidad = ? WHERE id = ?", [
      cantidad,
      id,
    ]);

    res.json({
      success: true,
      message: "Cantidad actualizada",
    });
  } catch (error) {
    console.error("Error en updateCartItem:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar cantidad",
      error: error.message,
    });
  }
};

// ============================================
// ELIMINAR ITEM DEL CARRITO
// ============================================
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const usuario_id = req.user.id;

    // Verificar que pertenece al usuario
    const [item] = await pool.query(
      "SELECT id FROM carrito WHERE id = ? AND usuario_id = ?",
      [id, usuario_id]
    );

    if (item.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Item no encontrado en tu carrito",
      });
    }

    await pool.query("DELETE FROM carrito WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Producto eliminado del carrito",
    });
  } catch (error) {
    console.error("Error en removeFromCart:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar del carrito",
      error: error.message,
    });
  }
};

// ============================================
// SINCRONIZAR CARRITO (localStorage → BD)
// ============================================
const syncCart = async (req, res) => {
  try {
    const { items } = req.body; // Array de { id, cantidad }
    const usuario_id = req.user.id;

    if (!items || items.length === 0) {
      return res.json({
        success: true,
        message: "No hay items para sincronizar",
      });
    }

    // Insertar cada item
    for (const item of items) {
      // Verificar si ya existe
      const [existing] = await pool.query(
        "SELECT id, cantidad FROM carrito WHERE usuario_id = ? AND producto_id = ?",
        [usuario_id, item.id]
      );

      if (existing.length > 0) {
        // Actualizar cantidad
        await pool.query(
          "UPDATE carrito SET cantidad = cantidad + ? WHERE id = ?",
          [item.cantidad, existing[0].id]
        );
      } else {
        // Insertar nuevo
        await pool.query(
          "INSERT INTO carrito (usuario_id, producto_id, cantidad) VALUES (?, ?, ?)",
          [usuario_id, item.id, item.cantidad]
        );
      }
    }

    res.json({
      success: true,
      message: "Carrito sincronizado exitosamente",
    });
  } catch (error) {
    console.error("Error en syncCart:", error);
    res.status(500).json({
      success: false,
      message: "Error al sincronizar carrito",
      error: error.message,
    });
  }
};

// ============================================
// VACIAR CARRITO
// ============================================
const clearCart = async (req, res) => {
  try {
    const usuario_id = req.user.id;

    await pool.query("DELETE FROM carrito WHERE usuario_id = ?", [usuario_id]);

    res.json({
      success: true,
      message: "Carrito vaciado",
    });
  } catch (error) {
    console.error("Error en clearCart:", error);
    res.status(500).json({
      success: false,
      message: "Error al vaciar carrito",
      error: error.message,
    });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  syncCart,
  clearCart,
};
