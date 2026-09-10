import { Router } from "express";
import {
  getEventos,
  findByIdEventos,
  createEvento,
  updateEvento,
  deleteEvento,
} from "../Controllers/eventos.controller.js";
import { verifyTokenHeader } from "../utils/token.utils.js";

const router = Router();

// Rutas Públicas
router.get("/eventos", getEventos);
router.get("/eventos/:id", findByIdEventos);

// Rutas Protegidas
router.post("/eventos", verifyTokenHeader, createEvento);
router.put("/eventos/:id", verifyTokenHeader, updateEvento);
router.delete("/eventos/:id", verifyTokenHeader, deleteEvento);

export default router;
