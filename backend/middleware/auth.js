// backend/middleware/auth.js

const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Obtener token del header
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(403).json({
      success: false,
      message: "No se proporcionó token",
    });
  }

  // El token viene como "Bearer TOKEN", extraer solo TOKEN
  const tokenValue = token.startsWith("Bearer ") ? token.slice(7) : token;

  try {
    // Verificar y decodificar el token
    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

    // Agregar los datos del usuario al request
    req.user = decoded;

    // Continuar al siguiente middleware/controlador
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
};

module.exports = { verifyToken };
