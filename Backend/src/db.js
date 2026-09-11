import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Verificación inicial de la conexión
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error al conectar a la BD de Supabase:", err.stack);
  }
  console.log("Conexión exitosa a PostgreSQL en Supabase");
  release();
});
