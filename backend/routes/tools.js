import { Router } from "express";
import {
  removeBackground,
  upscaleImage,
  captionImage,
} from "../services/hf.js";

const router = Router();

router.post(["/remove-background", "/remove-bg"], async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }
    const resultBase64 = await removeBackground(image);
    res.json({ image: resultBase64 });
  } catch (err) {
    next(err);
  }
});

router.post("/upscale-image", async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }
    const resultBase64 = await upscaleImage(image);
    res.json({ image: resultBase64 });
  } catch (err) {
    next(err);
  }
});

router.post("/caption-image", async (req, res, next) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }
    const caption = await captionImage(image);
    res.json({ caption });
  } catch (err) {
    next(err);
  }
});

export default router;
