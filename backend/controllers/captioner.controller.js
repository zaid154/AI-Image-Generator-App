import { generateCaption } from "../services/captioner.service.js";

export async function handleCaptionImage(req, res) {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, "");
    const caption = await generateCaption(cleanBase64);

    res.json({ caption });
  } catch (error) {
    console.error("Captioner Controller error:", error);
    res.status(500).json({ error: error.message || "Failed to generate caption" });
  }
}
