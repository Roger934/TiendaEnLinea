// backend/routes/cartRoutes.js

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Gestión del carrito de compras (requiere autenticación)
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Ver carrito del usuario
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contenido del carrito
 */

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Agregar producto al carrito
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               producto_id:
 *                 type: integer
 *                 example: 1
 *               cantidad:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Producto agregado al carrito
 */

/**
 * @swagger
 * /api/cart/{id}:
 *   put:
 *     summary: Actualizar cantidad en carrito
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cantidad:
 *                 type: integer
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cantidad actualizada
 */

/**
 * @swagger
 * /api/cart/{id}:
 *   delete:
 *     summary: Eliminar producto del carrito
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Producto eliminado del carrito
 */
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
