import { Router } from "express";
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "../Controllers/categoria.controller.js";
import { verifyTokenHeader } from "../utils/token.utils.js";

const router = Router();

router.get("/categorias", getCategorias);
router.post("/categorias", verifyTokenHeader, createCategoria);
router.put("/categorias/:id", verifyTokenHeader, updateCategoria);
router.delete("/categorias/:id", verifyTokenHeader, deleteCategoria);

export default router;
