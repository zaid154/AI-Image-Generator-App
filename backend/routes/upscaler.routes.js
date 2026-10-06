import { Router } from "express";
import { handleUpscaleImage } from "../controllers/upscaler.controller.js";

const router = Router();

router.post("/upscale-image", handleUpscaleImage);
router.post("/upscale", handleUpscaleImage);

export default router;
