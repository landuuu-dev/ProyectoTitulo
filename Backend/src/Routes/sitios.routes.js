import { Router } from "express";
import {
  getSitios,
  findByIdSitios,
  create,
  update,
  deleteSitio,
  getSitiosCercanos,
} from "../Controllers/sitios.controller.js";
import { verifyTokenHeader } from "../utils/token.utils.js";

const router = Router();

// 1. Rutas específicas (DEBEN ir arriba)
router.get("/sitios", getSitios);
router.get("/sitios/cercanos", getSitiosCercanos);

// 2. Rutas dinámicas con parámetros (DEBEN ir abajo)
router.get("/sitios/:id", findByIdSitios);

// Rutas protegidas
router.post("/sitios", verifyTokenHeader, create);
router.put("/sitios/:id", verifyTokenHeader, update);
router.delete("/sitios/:id", verifyTokenHeader, deleteSitio);

export default router;
