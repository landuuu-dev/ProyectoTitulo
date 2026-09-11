import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/auth.repository.js";
import { hashPassword, comparePassword } from "../utils/hash.utils.js";

const SECRET_KEY = process.env.SECRET_KEY || "clave_de_respaldo_local";

//LISTAR TODOS LOS USUARIOS
export const getUsers = async (req, res) => {
  try {
    const users = await UserRepository.getUsers();
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener usuarios", details: error.message });
  }
};
//LISTAR POR id
export const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await UserRepository.findById(id);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener el usuario", details: error.message });
  }
};
//LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("---> Datos recibidos en body:", { email, password });

    const usuario = await UserRepository.findByEmail(email);

    if (!usuario) {
      console.log("---> Usuario no encontrado en BD para email:", email);
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    console.log("---> Usuario hallado en BD:", usuario.email);
    console.log("---> Hash almacenado en BD:", usuario.password);

    // Comparación directa de bcrypt
    const isMatch = await bcrypt.compare(password, usuario.password);
    console.log("---> Resultado de bcrypt.compare:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    // Si coincide, genera el token JWT...
    // const token = generateToken(usuario);
    // return res.json({ token, usuario });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ error: error.message });
  }
};
//REGISTRO
export const register = async (req, res) => {
  const { nombre, email, password, id_rol } = req.body;
  if (!nombre || !email || !password || !id_rol) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios" });
  }

  try {
    const hashedPassword = await hashPassword(password);
    const newUser = await UserRepository.create({
      nombre,
      email,
      password: hashedPassword,
      id_rol,
    });

    res.status(201).json(newUser);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(400).json({ message: "El email ya está registrado" });
    }
    res
      .status(500)
      .json({ error: "Error al crear usuario", details: error.message });
  }
};
//ACTUALIZAR USUARIO
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, password, id_rol } = req.body;

  try {
    let updatedUser;

    if (password) {
      const hashedPassword = await hashPassword(password);
      updatedUser = await UserRepository.updateWithPassword({
        id,
        nombre,
        email,
        password: hashedPassword,
        id_rol,
      });
    } else {
      updatedUser = await UserRepository.updateWithoutPassword({
        id,
        nombre,
        email,
        id_rol,
      });
    }

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({
      error: "Error al actualizar el usuario",
      details: error.message,
    });
  }
};
//ELIMINAR USUARIO
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await UserRepository.delete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(400).json({
        message:
          "No se puede eliminar el usuario porque tiene registros asociados",
      });
    }
    res
      .status(500)
      .json({ error: "Error al eliminar usuario", details: error.message });
  }
};

//LOGOUT
export const logout = async (req, res) => {
  try {
    res.status(200).json({
      message:
        "Cierre de sesión exitoso. Por favor elimine el token del almacenamiento local.",
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al cerrar sesión",
      details: error.message,
    });
  }
};
