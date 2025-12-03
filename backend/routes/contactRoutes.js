// backend/routes/contactRoutes.js
/**
 * @swagger
 * tags:
 *   name: Contact
 *   description: Formulario de contacto
 */

/**
 * @swagger
 * /api/contact:
 *   post:
 *     summary: 🟢 Enviar mensaje de contacto (FUNCIONA SIN TOKEN)
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               mensaje:
 *                 type: string
 *                 example: Tengo una pregunta sobre un producto
 *     responses:
 *       200:
 *         description: Mensaje enviado, auto-respuesta enviada por email
 */
const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contactController");

// Ruta pública (no requiere autenticación)
router.post("/", contactController.sendContactMessage);

module.exports = router;
