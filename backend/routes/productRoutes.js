// backend/routes/productRoutes.js

const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// Rutas PÚBLICAS (sin autenticación)
/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Gestión de productos de la tienda
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: 🟢 Obtener todos los productos (FUNCIONA SIN TOKEN)
 *     tags: [Products]
 *     description: Lista todos los productos con filtros opcionales
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoría (ej. Procesadores, Tarjetas Gráficas, Memorias RAM)
 *       - in: query
 *         name: precioMin
 *         schema:
 *           type: number
 *         description: Precio mínimo
 *       - in: query
 *         name: precioMax
 *         schema:
 *           type: number
 *         description: Precio máximo
 *       - in: query
 *         name: enOferta
 *         schema:
 *           type: boolean
 *         description: Solo productos en oferta
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 productos:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get("/", productController.getAllProducts);
router.get("/category/:categoryId", productController.getProductsByCategory);
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: 🟢 Obtener producto por ID (FUNCIONA SIN TOKEN)
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Detalles del producto
 *       404:
 *         description: Producto no encontrado
 */
router.get("/:id", productController.getProductById);

module.exports = router;
