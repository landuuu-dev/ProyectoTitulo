import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";

// Obtener la clave desde variables de entorno
const SECRET_KEY = process.env.SECRET_KEY || "clave_de_respaldo_local";

// POST /login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña requeridos" });
  }

  try {
    // 1. Buscar el usuario por email
    const result = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.email, u.password, r.nombre_rol 
       FROM usuarios u 
       JOIN roles r ON u.id_rol = r.id_rol 
       WHERE u.email = $1`,
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const user = result.rows[0];

    // 2. Comparar la contraseña ingresada con el Hash guardado en BD
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // 3. Generar el Token JWT usando la variable de entorno
    const token = jwt.sign(
      {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.nombre_rol,
      },
      SECRET_KEY,
      { expiresIn: "8h" },
    );

    // 4. Responder con los datos del usuario y el token
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        email: user.email,
        rol: user.nombre_rol,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error en el servidor", details: error.message });
  }
};
