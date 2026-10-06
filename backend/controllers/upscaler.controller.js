import { upscaleImage } from "../services/upscaler.service.js";

export async function handleUpscaleImage(req, res) {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, "");
    const resultBase64 = await upscaleImage(cleanBase64);

    res.json({ image: resultBase64 });
  } catch (error) {
    console.error("Upscaler Controller error:", error);
    res.status(500).json({ error: error.message || "Failed to upscale image" });
  }
}
