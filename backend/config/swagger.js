// backend/config/swagger.js

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TechStore API",
      version: "1.0.0",
      description:
        "API REST para TechStore - Tienda en línea de componentes de PC",
      contact: {
        name: "TechStore Team",
        email: "techstore@example.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de desarrollo",

      },
      {
        url: "https://techstore-gvy9.onrender.com",
        description: "Servidor de producción",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: 'Ingresa el token JWT sin el prefijo "Bearer"',
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = { swaggerUi, swaggerDocs };
