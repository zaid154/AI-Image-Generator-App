import { Router } from "express";
import { handleCaptionImage } from "../controllers/captioner.controller.js";

const router = Router();

router.post("/caption-image", handleCaptionImage);
router.post("/caption", handleCaptionImage);

export default router;
