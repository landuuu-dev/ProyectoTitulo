import { Router } from "express";
import {
  getMisFavoritos,
  addFavorito,
  removeFavorito,
  removeFavoritoEvento,
} from "../Controllers/favoritos.controllers.js";
import { verifyTokenHeader } from "../utils/token.utils.js";

const router = Router();

// Todas las rutas de favoritos son privadas
router.use(verifyTokenHeader);

router.get("/favoritos", getMisFavoritos);
router.post("/favoritos", addFavorito);

// Rutas explícitas de eliminación
router.delete("/favoritos/sitios/:id_sitio", removeFavorito);
router.delete("/favoritos/eventos/:id_evento", removeFavoritoEvento);

export default router;
