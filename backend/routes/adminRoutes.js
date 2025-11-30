// backend/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { verifyToken } = require("../middleware/auth");

// Todas las rutas requieren autenticación Y rol de admin
// Agregamos un middleware para verificar que sea admin

const verifyAdmin = (req, res, next) => {
  if (req.user.rol !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Acceso denegado. Solo administradores.",
    });
  }
  next();
};

// CRUD de Productos
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

module.exports = router;
