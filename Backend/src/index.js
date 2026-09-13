import express from "express";
import morgan from "morgan";
import authRoutes from "./Routes/auth.routes.js";
import sitiosRoutes from "./Routes/sitios.routes.js";
import eventosRoutes from "./Routes/eventos.routes.js";
import categoriasRoutes from "./Routes/categoria.routes.js"; // <--- Importar la RUTA, no el controlador
import favoritosRoutes from "./Routes/favoritos.routes.js"; // <--- Módulo de favoritos
import cors from "cors";
import traduccionRoutes from "./routes/traduccionRoutes.js";

process.loadEnvFile();
const PORT = process.env.PORT ?? 3000;

const app = express();

// Middlewares principales
app.use(morgan("dev"));
app.use(express.json());
// Permite peticiones desde cualquier origen durante las pruebas
app.use(cors());
app.use("/traduccion", traduccionRoutes);

// Registro de rutas
app.use(authRoutes);
app.use(sitiosRoutes);
app.use(eventosRoutes);
app.use(categoriasRoutes);
app.use(favoritosRoutes);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log("App iniciada con éxito");
});
