import { pool } from "../db.js";

export const UserRepository = {
  async getUsers() {
    const result = await pool.query(`
      SELECT u.id_usuario, u.nombre, u.email, u.fecha_registro, r.nombre_rol 
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.id_rol
    `);
    return result.rows || null;
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.email, u.fecha_registro, r.nombre_rol 
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.id_usuario = $1`,
      [id],
    );
    return result.rows[0] || null;
  },

  async findByEmail(email) {
    const result = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.email, u.password, r.nombre_rol 
       FROM usuarios u 
       JOIN roles r ON u.id_rol = r.id_rol 
       WHERE u.email = $1`,
      [email],
    );
    return result.rows[0] || null;
  },

  //API
  async create({ nombre, email, password, id_rol }) {
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, id_rol) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id_usuario, nombre, email, id_rol, fecha_registro`,
      [nombre, email, password, id_rol],
    );
    return result.rows[0];
  },

  async updateWithPassword({ id, nombre, email, password, id_rol }) {
    const result = await pool.query(
      `UPDATE usuarios 
       SET nombre = $1, email = $2, password = $3, id_rol = $4 
       WHERE id_usuario = $5 
       RETURNING id_usuario, nombre, email, id_rol, fecha_registro`,
      [nombre, email, password, id_rol, id],
    );
    return result.rows[0] || null;
  },

  async updateWithoutPassword({ id, nombre, email, id_rol }) {
    const result = await pool.query(
      `UPDATE usuarios 
       SET nombre = $1, email = $2, id_rol = $3 
       WHERE id_usuario = $4 
       RETURNING id_usuario, nombre, email, id_rol, fecha_registro`,
      [nombre, email, id_rol, id],
    );
    return result.rows[0] || null;
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario",
      [id],
    );
    return result.rows[0] || null;
  },
};
