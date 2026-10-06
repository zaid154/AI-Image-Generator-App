import { Router } from "express";
import { 
  handleGenerateImage, 
  handleExpandPrompt, 
  handlePromptVariations,
  handleInpaintImage 
} from "../controllers/generator.controller.js";

const router = Router();

router.post("/generate-image", handleGenerateImage);
router.post("/generate", handleGenerateImage);
router.post("/expand-prompt", handleExpandPrompt);
router.post("/prompt-variations", handlePromptVariations);
router.post("/inpaint-image", handleInpaintImage);

export default router;
