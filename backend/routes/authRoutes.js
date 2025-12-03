// backend/routes/authRoutes.js

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y gestión de usuarios
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     description: Crea una nueva cuenta de usuario en el sistema
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               telefono:
 *                 type: string
 *                 example: 4491234567
 *               direccion:
 *                 type: string
 *                 example: Av. Universidad 123
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error de validación o email ya existe
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /api/auth/captcha:
 *   get:
 *     summary: 🟢 Generar captcha (FUNCIONA SIN TOKEN)
 *     tags: [Auth]
 *     description: Genera una imagen SVG de captcha para validación humana
 *     responses:
 *       200:
 *         description: Captcha generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 captchaSvg:
 *                   type: string
 *                   description: Imagen SVG del captcha
 *                 captchaToken:
 *                   type: string
 *                   description: Token base64 para validar el captcha
 */
router.get("/captcha", authController.generateCaptcha);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     description: Autentica un usuario y retorna un token JWT (requiere captcha)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - captchaText
 *               - captchaToken
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *               captchaText:
 *                 type: string
 *                 example: A7K9P
 *                 description: Texto del captcha generado
 *               captchaToken:
 *                 type: string
 *                 example: QTdLOVA=
 *                 description: Token recibido de /api/auth/captcha
 *     responses:
 *       200:
 *         description: Login exitoso, retorna JWT token
 *       401:
 *         description: Credenciales inválidas o captcha incorrecto
 *       403:
 *         description: Cuenta bloqueada por intentos fallidos
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: 🟢 Solicitar recuperación de contraseña (FUNCIONA SIN TOKEN)
 *     tags: [Auth]
 *     description: Envía un email con link para restablecer contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *     responses:
 *       200:
 *         description: Email enviado si el usuario existe
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña con token
 *     tags: [Auth]
 *     description: Cambia la contraseña usando el token recibido por email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123token456xyz
 *               newPassword:
 *                 type: string
 *                 example: newPassword123
 *     responses:
 *       200:
 *         description: Contraseña actualizada exitosamente
 *       400:
 *         description: Token inválido o expirado
 */
router.post("/reset-password", authController.resetPassword);

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Verificar token JWT
 *     tags: [Auth]
 *     description: Valida si un token JWT es válido
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token válido
 *       401:
 *         description: Token inválido o expirado
 */
router.get("/verify", verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     tags: [Auth]
 *     description: Cierra la sesión del usuario
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout exitoso
 */
router.post("/logout", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Logout exitoso",
  });
});

module.exports = router;
