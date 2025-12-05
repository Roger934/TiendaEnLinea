// backend/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");
const { pool } = require("../config/database");

const verifyAdmin = (req, res, next) => {
  if (req.user.rol !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado. Solo administradores.",
    });
  }
  next();
};

// ============================================
// GET TODOS LOS PRODUCTOS (SOLO ACTIVOS)
// ============================================
router.get("/products", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const [productos] = await pool.query(`
        SELECT p.*, c.nombre AS categoria_nombre
        FROM productos p
        JOIN categorias c ON p.categoria_id = c.id
        WHERE p.activo = 1
        ORDER BY p.id DESC
      `);

    return res.json({
      success: true,
      productos,
    });
  } catch (error) {
    console.error("Error en GET /admin/products:", error);
    return res.status(500).json({
      success: false,
      message: "Error al obtener productos",
    });
  }
});

// CRUD de productos
router.post(
  "/products",
  verifyToken,
  verifyAdmin,
  adminController.createProduct
);
router.put(
  "/products/:id",
  verifyToken,
  verifyAdmin,
  adminController.updateProduct
);
router.delete(
  "/products/:id",
  verifyToken,
  verifyAdmin,
  adminController.deleteProduct
);

// Reportes
router.get("/sales", verifyToken, verifyAdmin, adminController.getTotalSales);
router.get(
  "/sales-chart",
  verifyToken,
  verifyAdmin,
  adminController.getSalesChart
);
router.get(
  "/inventory",
  verifyToken,
  verifyAdmin,
  adminController.getInventory
);

router.post(
  "/upload-image",
  verifyToken,
  verifyAdmin,
  upload.single("image"),
  adminController.uploadImage
);

module.exports = router;
