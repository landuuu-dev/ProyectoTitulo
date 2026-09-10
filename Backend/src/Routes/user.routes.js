import { Router } from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../Controllers/user.controller.js";
import { verifyToken } from "../Middlewares/auth.middleware.js";

const router = Router();

router.get("/usuarios", getUsers);
router.get("/usuarios/:id", getUserById);
router.post("/usuarios", createUser); // Registro público o protegido según tu caso

// Rutas protegidas que requieren Token de sesión:
router.put("/usuarios/:id", verifyToken, updateUser);
router.delete("/usuarios/:id", verifyToken, deleteUser);

export default router;
