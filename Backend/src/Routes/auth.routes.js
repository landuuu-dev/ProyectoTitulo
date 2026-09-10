import { Router } from "express";
import {
  login,
  register,
  updateUser,
  deleteUser,
  getUserById,
  getUsers,
  logout,
} from "../Controllers/auth.controller.js";
import { verifyTokenHeader } from "../utils/token.utils.js";

const router = Router();
router.get("/usuarios/:id", getUserById);
router.get("/usuarios", getUsers);
router.post("/login", login);
router.post("/usuarios", register);

// Protegidas usando la utilidad
router.post("/logout", verifyTokenHeader, logout);
router.put("/usuarios/:id", verifyTokenHeader, updateUser);
router.delete("/usuarios/:id", verifyTokenHeader, deleteUser);

export default router;
