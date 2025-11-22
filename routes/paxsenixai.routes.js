import express from "express";
import { generateDietPlan } from "../controllers/diet.controller.js";

const router = express.Router();

router.post("/generate", generateDietPlan);
export default router;
