import { removeBackground } from "../services/bgRemover.service.js";

export async function handleRemoveBackground(req, res) {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, "");
    const resultBase64 = await removeBackground(cleanBase64);

    res.json({ image: resultBase64 });
  } catch (error) {
    console.error("BG Remover Controller error:", error);
    res.status(500).json({ error: error.message || "Failed to remove background" });
  }
}
