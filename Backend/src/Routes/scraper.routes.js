import { Router } from "express";

import { probarScraperEventos } from "../Controllers/scraper.controllers.js";

const router = Router();

router.get("/scraper/eventos", probarScraperEventos);

export default router;
