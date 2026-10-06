import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/health", (req, res) => {
  res.json({ service: "captioner-service", status: "online", model: "Salesforce/blip-image-captioning-large" });
});

app.post("/caption", async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Image base64 is required" });
    }

    const cleanBase64 = image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(cleanBase64, "base64");

    const response = await fetch(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_ACCESS_TOKEN}`,
          "Content-Type": "application/octet-stream",
        },
        method: "POST",
        body: imageBuffer,
      }
    );

    if (!response.ok) {
      throw new Error(`HF BLIP API error: ${response.statusText}`);
    }

    const result = await response.json();
    const caption = result[0]?.generated_text || "A high quality artistic image";

    res.json({ caption });
  } catch (error) {
    console.error("Captioner Service Error:", error);
    res.status(500).json({ error: error.message || "Failed to extract prompt from image" });
  }
});

const PORT = process.env.PORT || 5005;
app.listen(PORT, () => {
  console.log(`👁️ [Captioner Service] Running on http://localhost:${PORT}`);
});
