// backend/routes/orderRoutes.js
/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Gestión de órdenes de compra (requiere autenticación)
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Crear nueva orden de compra
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - direccion
 *               - ciudad
 *               - codigoPostal
 *               - pais
 *               - telefono
 *               - metodoPago
 *             properties:
 *               direccion:
 *                 type: string
 *                 example: Av. Universidad 123
 *               ciudad:
 *                 type: string
 *                 example: Aguascalientes
 *               codigoPostal:
 *                 type: string
 *                 example: 20000
 *               pais:
 *                 type: string
 *                 example: Mexico
 *               telefono:
 *                 type: string
 *                 example: 4491234567
 *               metodoPago:
 *                 type: string
 *                 example: tarjeta
 *               codigoCupon:
 *                 type: string
 *                 example: BIENVENIDO10
 *     responses:
 *       200:
 *         description: Orden creada exitosamente, PDF enviado por email
 */
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { verifyToken } = require("../middleware/auth");

// Crear orden (requiere autenticación)
router.post("/", verifyToken, orderController.createOrder);

module.exports = router;
