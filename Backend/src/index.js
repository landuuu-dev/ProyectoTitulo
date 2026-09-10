import express from "express";
import morgan from "morgan";
import authRoutes from "./Routes/auth.routes.js";
import sitiosRoutes from "./Routes/sitios.routes.js";

process.loadEnvFile();
const PORT = process.env.PORT ?? 3000;

const app = express();

app.use(express.json());
app.use(authRoutes);
app.use(sitiosRoutes);

app.listen(PORT);
console.log("server on port", PORT);
console.log("app iniciada");
