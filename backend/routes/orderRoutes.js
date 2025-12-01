// backend/routes/orderRoutes.js

const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifyToken } = require("../middleware/auth");

// Crear orden (requiere autenticación)
router.post("/", verifyToken, orderController.createOrder);

module.exports = router;
