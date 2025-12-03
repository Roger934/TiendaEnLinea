// backend/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

// Rutas públicas
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/captcha", authController.generateCaptcha);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Rutas protegidas
router.get("/verify", verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

router.post("/logout", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Logout exitoso",
  });
});

module.exports = router;
