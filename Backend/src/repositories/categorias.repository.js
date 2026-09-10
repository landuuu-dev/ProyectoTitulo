import { pool } from "../db.js";

export const CategoriasRepository = {
  async getCategorias() {
    const result = await pool.query(
      "SELECT * FROM categorias ORDER BY nombre_categoria ASC",
    );
    return result.rows;
  },

  async create(nombre_categoria) {
    const result = await pool.query(
      "INSERT INTO categorias (nombre_categoria) VALUES ($1) RETURNING *",
      [nombre_categoria],
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM categorias WHERE id_categoria = $1 RETURNING id_categoria",
      [id],
    );
    return result.rows[0] || null;
  },

  async update(id, nombre_categoria) {
    const result = await pool.query(
      "UPDATE categorias SET nombre_categoria = $1 WHERE id_categoria = $2 RETURNING *",
      [nombre_categoria, id],
    );
    return result.rows[0] || null;
  },
};
