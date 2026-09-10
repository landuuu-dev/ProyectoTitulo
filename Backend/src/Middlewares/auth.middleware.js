import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY || "clave_de_respaldo_local";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Soporta format: Bearer <token>

  if (!token) {
    return res
      .status(403)
      .json({ message: "Token requerido de autenticación" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Adjunta los datos del usuario al request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
