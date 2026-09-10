import { Router } from "express";
import {
  getSitios,
  findByIdSitios,
  create,
  update,
  deleteSitio,
} from "../Controllers/sitios.controller.js";
import { verifyTokenHeader } from "../utils/token.utils.js";

const router = Router();

// ==========================================
// Rutas Públicas (Lectura para visitantes)
// ==========================================

// Obtener todos los sitios patrimoniales
router.get("/sitios", getSitios);

// Obtener un sitio por su ID
router.get("/sitios/:id", findByIdSitios);

// ==========================================
// Rutas Protegidas (Requieren autenticación)
// ==========================================

// Crear un nuevo sitio patrimonial
router.post("/sitios", verifyTokenHeader, create);

// Actualizar un sitio patrimonial por ID
router.put("/sitios/:id", verifyTokenHeader, update);

// Eliminar un sitio patrimonial por ID
router.delete("/sitios/:id", verifyTokenHeader, deleteSitio);

export default router;
