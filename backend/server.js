// backend/server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { testConnection } = require("./config/database");

// Crear app de Express
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES
// ============================================

// CORS - Permitir peticiones del frontend
app.use(
  cors({
    origin: "*", // ← CAMBIO AQUÍ: Permitir cualquier origen
    credentials: true,
  })
);

// Parsear JSON en el body de las peticiones
app.use(express.json());

// Parsear datos de formularios
app.use(express.urlencoded({ extended: true }));

// ============================================
// RUTAS DE PRUEBA
// ============================================

// Ruta de prueba simple
app.get("/api/test", (req, res) => {
  res.json({
    message: "🚀 API funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

// Ruta para probar conexión a BD
app.get("/api/db-test", async (req, res) => {
  try {
    const { pool } = require("./config/database");
    const [rows] = await pool.query("SELECT COUNT(*) as total FROM productos");
    res.json({
      message: "✅ Conexión a BD exitosa",
      totalProductos: rows[0].total,
    });
  } catch (error) {
    res.status(500).json({
      message: "❌ Error en la BD",
      error: error.message,
    });
  }
});

// ============================================
// RUTAS
// ============================================
const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

// ============================================
// MANEJO DE ERRORES 404
// ============================================
app.use((req, res) => {
  res.status(404).json({
    message: "Ruta no encontrada",
    path: req.originalUrl,
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

const startServer = async () => {
  try {
    // Probar conexión a BD primero
    await testConnection();

    // Si la conexión es exitosa, iniciar servidor
    app.listen(PORT, () => {
      console.log(`\n🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📡 Prueba la API en: http://localhost:${PORT}/api/test`);
      console.log(
        `🗄️  Prueba la BD en: http://localhost:${PORT}/api/db-test\n`
      );
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();
