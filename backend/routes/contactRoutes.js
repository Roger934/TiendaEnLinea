// backend/routes/contactRoutes.js

const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// Ruta pública (no requiere autenticación)
router.post("/", contactController.sendContactMessage);

module.exports = router;
