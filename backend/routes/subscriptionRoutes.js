// backend/routes/subscriptionRoutes.js

const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");

// Ruta pública (no requiere autenticación)
router.post("/", subscriptionController.subscribe);

module.exports = router;
