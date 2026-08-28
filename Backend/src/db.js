import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
});

// Probar la conexión inicial
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error al conectar con PostgreSQL:", err.stack);
  }
  console.log("¡Conexión exitosa a la base de datos PostgreSQL!");
  release();
});
