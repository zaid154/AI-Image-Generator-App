import { Router } from "express";
import {
  generateBatchImages,
  expandPrompt,
  getPromptVariations,
  inpaintImage,
} from "../services/hf.js";

const router = Router();

router.post(["/generate-image", "/generate"], async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt?.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.HF_ACCESS_TOKEN || process.env.HF_ACCESS_TOKEN === "your_huggingface_access_token_here") {
      return res.status(401).json({
        error: "HF_ACCESS_TOKEN is missing. Please add your free Hugging Face token in backend/.env",
      });
    }

    const result = await generateBatchImages(req.body);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.post("/expand-prompt", async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt?.trim()) {
      return res.status(400).json({ error: "Prompt is required to expand" });
    }
    const expanded = await expandPrompt(prompt);
    res.json({ expandedPrompt: expanded });
  } catch (err) {
    next(err);
  }
});

router.post("/prompt-variations", async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt?.trim()) {
      return res.status(400).json({ error: "Prompt is required for variations" });
    }
    const variations = await getPromptVariations(prompt);
    res.json({ variations });
  } catch (err) {
    next(err);
  }
});

router.post("/inpaint-image", async (req, res, next) => {
  try {
    const { image, mask, prompt } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Source image is required for inpainting" });
    }
    const result = await inpaintImage({ image, mask, prompt });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
