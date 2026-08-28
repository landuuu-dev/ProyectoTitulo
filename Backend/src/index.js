import express from "express";
import morgan from "morgan";
import { pool } from "./db.js";

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(morgan("dev"));
app.use(express.json());

// Ruta de prueba
app.get("/ping", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "pong", time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
