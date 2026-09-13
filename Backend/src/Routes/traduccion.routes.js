import express from "express";
import { traducir } from "../Controllers/traduccion.controller.js";

const router = express.Router();

router.post("/", traducir);

export default router;
