import { Router } from "express";
import { login } from "../Controllers/auth.controller.js";

const router = Router();

router.post("/login", login);

export default router;
