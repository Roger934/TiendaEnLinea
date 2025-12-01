// backend/routes/cartRoutes.js

const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { verifyToken } = require("../middleware/auth");

// Todas las rutas del carrito requieren autenticación
router.post("/", verifyToken, cartController.addToCart);
router.get("/", verifyToken, cartController.getCart);
router.put("/:id", verifyToken, cartController.updateCartItem);
router.delete("/:id", verifyToken, cartController.removeFromCart);
router.post("/sync", verifyToken, cartController.syncCart);
router.delete("/clear/all", verifyToken, cartController.clearCart);

module.exports = router;
