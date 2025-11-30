// backend/config/database.js

const mysql = require("mysql2");
require("dotenv").config();

// Crear pool de conexiones
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Convertir a promesas
const promisePool = pool.promise();

// Función para probar conexión
const testConnection = async () => {
  try {
    const [rows] = await promisePool.query("SELECT 1 + 1 AS resultado");
    console.log("✅ Conexión exitosa a la base de datos");
    console.log("Resultado de prueba:", rows[0].resultado);
  } catch (error) {
    console.error("❌ Error al conectar con la base de datos:", error.message);
    process.exit(1);
  }
};

module.exports = { pool: promisePool, testConnection };
