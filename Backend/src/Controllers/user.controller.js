import bcrypt from "bcryptjs";
import { pool } from "../db.js"; // Importa tu conexión a PostgreSQL

// GET /usuarios
export const getUsers = async (req, res) => {
  try {
    const response = await pool.query(`
      SELECT 
        u.id_usuario, 
        u.nombre, 
        u.email, 
        u.fecha_registro, 
        r.id_rol, 
        r.nombre_rol 
      FROM usuarios u
      JOIN roles r ON u.id_rol = r.id_rol
      ORDER BY u.id_usuario ASC
    `);
    res.status(200).json(response.rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener usuarios", details: error.message });
  }
};

// GET /usuarios/:id
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await pool.query(
      `SELECT 
        u.id_usuario, 
        u.nombre, 
        u.email, 
        u.fecha_registro, 
        r.id_rol, 
        r.nombre_rol 
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.id_usuario = $1`,
      [id],
    );

    if (response.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(response.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener el usuario", details: error.message });
  }
};

// POST /usuarios
export const createUser = async (req, res) => {
  const { nombre, email, password, id_rol } = req.body;

  if (!nombre || !email || !password || !id_rol) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios" });
  }

  try {
    // Hashear la contraseña antes de guardar
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const response = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, id_rol) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id_usuario, nombre, email, id_rol, fecha_registro`,
      [nombre, email, hashedPassword, id_rol],
    );

    res.status(201).json(response.rows[0]);
  } catch (error) {
    // Código 23505 corresponde a llave duplicada (Email ya existe)
    if (error.code === "23505") {
      return res.status(400).json({ message: "El email ya está registrado" });
    }
    res
      .status(500)
      .json({ error: "Error al crear usuario", details: error.message });
  }
};

// PUT /usuarios/:id
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, password, id_rol } = req.body;

  try {
    let query = "";
    let values = [];

    // Actualización condicional si incluye cambio de contraseña
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      query = `
        UPDATE usuarios 
        SET nombre = $1, email = $2, password = $3, id_rol = $4 
        WHERE id_usuario = $5 
        RETURNING id_usuario, nombre, email, id_rol, fecha_registro
      `;
      values = [nombre, email, hashedPassword, id_rol, id];
    } else {
      query = `
        UPDATE usuarios 
        SET nombre = $1, email = $2, id_rol = $3 
        WHERE id_usuario = $4 
        RETURNING id_usuario, nombre, email, id_rol, fecha_registro
      `;
      values = [nombre, email, id_rol, id];
    }

    const response = await pool.query(query, values);

    if (response.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(response.rows[0]);
  } catch (error) {
    res
      .status(500)
      .json({
        error: "Error al actualizar el usuario",
        details: error.message,
      });
  }
};

// DELETE /usuarios/:id
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const response = await pool.query(
      "DELETE FROM usuarios WHERE id_usuario = $1 RETURNING id_usuario",
      [id],
    );

    if (response.rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    // Código 23503 corresponde a violación de FK (Usuario ligado a sitios/favoritos)
    if (error.code === "23503") {
      return res.status(400).json({
        message:
          "No se puede eliminar el usuario porque tiene registros asociados (Sitios o Favoritos)",
      });
    }
    res
      .status(500)
      .json({ error: "Error al eliminar usuario", details: error.message });
  }
};
