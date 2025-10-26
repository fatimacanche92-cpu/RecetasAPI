// ==============================
// 📦 Importaciones principales
// ==============================
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// ==============================
// 📁 Importar rutas
// ==============================
import usuariosRoutes from "./routes/usuarios.js";
import sesionesRoutes from "./routes/sesiones.js";
import categoriasRoutes from "./routes/categorias.js";
import recetasRoutes from "./routes/recetas.js";
import ingredientesRoutes from "./routes/ingredientes.js";
import pasosRoutes from "./routes/pasos.js";
import valoracionesRoutes from "./routes/valoraciones.js";
import suscripcionesRoutes from "./routes/suscripciones.js";

// ==============================
// ⚙️ Configuración base
// ==============================
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ==============================
// 📘 CONFIGURACIÓN DE SWAGGER
// ==============================
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CookShare API",
      version: "1.0.0",
      description:
        "API para gestionar recetas, usuarios, categorías, ingredientes, pasos, valoraciones y suscripciones.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de desarrollo local",
      },
    ],
  },
  // 👇 Aquí Swagger buscará TODAS las rutas dentro de src/routes
  apis: ["./src/routes/*.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// 🟢 Endpoint para la documentación
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ==============================
// 🧩 RUTAS PRINCIPALES
// ==============================
app.use("/api/categorias", categoriasRoutes);
app.use("/api/ingredientes", ingredientesRoutes);
app.use("/api/pasos", pasosRoutes);
app.use("/api/recetas", recetasRoutes);
app.use("/api/sesiones", sesionesRoutes);
app.use("/api/suscripciones", suscripcionesRoutes);
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/valoraciones", valoracionesRoutes);

// ==============================
// 🚀 INICIO DEL SERVIDOR
// ==============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en: http://localhost:${PORT}`);
  console.log(`📚 Swagger disponible en: http://localhost:${PORT}/api-docs`);
});
