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

// Rutas públicas
router.get("/sitios", getSitios);

router.get("/sitios/cercanos", getSitiosCercanos);

// Ruta dinámica
router.get("/sitios/:id", findByIdSitios);

// Rutas protegidas
router.post("/sitios", verifyTokenHeader, create);

router.put("/sitios/:id", verifyTokenHeader, update);

router.delete("/sitios/:id", verifyTokenHeader, deleteSitio);

export default router;
