import { Router } from "express";
import { pool } from "../db.js";

const router = Router();

//LISTAR USUARIOS
router.get("/usuarios", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM usuarios");
  res.json(rows);
});

//LISTAR POR ID
router.get("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    "SELECT id_usuario, nombre, email, id_rol, fecha_registro FROM usuarios WHERE id_usuario = $1",
    [id],
  );
  if (rows.length === 0) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }
  res.json(rows);
});

// CREAR USUARIO
router.post("/usuarios", async (req, res) => {
  try {
    const data = req.body;

    // Cambiamos USERS por usuarios y agregamos RETURNING para devolver el registro
    const result = await pool.query(
      "INSERT INTO usuarios (nombre, email, password, id_rol) VALUES ($1, $2, $3, $4) RETURNING *",
      [data.nombre, data.email, data.password, Number(data.id_rol)],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ message: "El correo ya está registrado" });
    }
    if (error.code === "23503") {
      return res
        .status(400)
        .json({ message: "El id_rol enviado no existe en la tabla roles" });
    }
    res.status(500).json({ error: error.message });
  }
});

// ELIMINAR USUARIO
router.delete("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM usuarios WHERE id_usuario = $1",
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Corregido: se devuelve un mensaje de confirmación
    return res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    // Código 23503: Violación de restricción de clave foránea
    if (error.code === "23503") {
      return res.status(400).json({
        message:
          "No se puede eliminar el usuario porque tiene sitios patrimoniales asociados.",
      });
    }

    res.status(500).json({ error: error.message });
  }
});

// ACTUALIZAR USUARIO
router.put("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, id_rol } = req.body;

    const query = `
      UPDATE usuarios
      SET nombre = $1,
          email = $2,
          password = $3,
          id_rol = $4
      WHERE id_usuario = $5
      RETURNING id_usuario, nombre, email, id_rol, fecha_registro;
    `;

    const values = [nombre, email, password, id_rol, id];
    const { rows, rowCount } = await pool.query(query, values);

    if (rowCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    return res.json(rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({
        message: "El correo electrónico ya está en uso por otro usuario",
      });
    }
    if (error.code === "23503") {
      return res
        .status(400)
        .json({ message: "El id_rol especificado no existe" });
    }

    res.status(500).json({ error: error.message });
  }
});

export default router;
