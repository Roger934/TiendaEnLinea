// backend/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Rutas públicas (sin autenticación)
router.post("/register", authController.register);
router.post("/login", authController.login);

// Rutas protegidas (requieren JWT)
const { verifyToken } = require("../middleware/auth");
router.get("/verify", verifyToken, authController.verify);
router.post("/logout", verifyToken, authController.logout);

module.exports = router;
