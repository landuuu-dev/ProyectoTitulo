import express from "express";
import { PORT } from "./config.js";
import morgan from "morgan";
import userRoutes from "./Routes/user.routes.js";
import authRoutes from "./Routes/auth.routes.js";

const app = express();

app.use(express.json());
app.use(userRoutes);
app.use(authRoutes);

app.listen(PORT);
console.log("server on port", PORT);
console.log("app iniciada");
