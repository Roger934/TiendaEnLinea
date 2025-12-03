// backend/routes/subscriptionRoutes.js
/**
 * @swagger
 * tags:
 *   name: Subscription
 *   description: Suscripción a newsletter
 */

/**
 * @swagger
 * /api/subscription:
 *   post:
 *     summary: 🟢 Suscribirse al newsletter (FUNCIONA SIN TOKEN)
 *     tags: [Subscription]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario@example.com
 *     responses:
 *       200:
 *         description: Suscripción exitosa, cupón enviado por email
 */
const express = require("express");
const router = express.Router();
const subscriptionController = require("../controllers/subscriptionController");

// Ruta pública (no requiere autenticación)
router.post("/", subscriptionController.subscribe);

module.exports = router;
