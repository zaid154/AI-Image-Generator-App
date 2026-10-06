import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { HfInference } from "@huggingface/inference";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

const aspectRatioMap = {
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1344, height: 768 },
  "9:16": { width: 768, height: 1344 },
  "4:3": { width: 1152, height: 896 },
  "3:4": { width: 896, height: 1152 },
};

async function optimizePrompt(userPrompt) {
  try {
    const res = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-72B-Instruct",
      messages: [
        {
          role: "system",
          content:
            "You are an expert AI image prompt optimizer for diffusion models (FLUX.1). Fix any spelling mistakes, typos, grammatical errors, or Hinglish keywords in the user's input. Refine the prompt into a vivid, photorealistic or stylistically precise description (under 40 words) specifying subject, lighting, environment, and textures. Return ONLY the refined prompt text without quotation marks, introductions, or explanations.",
        },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 90,
    });
    const cleaned = res.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, "");
    return cleaned || userPrompt;
  } catch (err) {
    console.warn("Prompt enhancement fallback to original:", err.message);
    return userPrompt;
  }
}

app.get("/health", (req, res) => {
  res.json({ service: "generator-service", status: "online", model: "FLUX.1-schnell" });
});

app.post("/generate", async (req, res) => {
  try {
    const { prompt, aspectRatio = "1:1" } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.HF_ACCESS_TOKEN) {
      return res.status(401).json({ error: "HF_ACCESS_TOKEN is missing in generator-service/.env" });
    }

    const enhancedPrompt = await optimizePrompt(prompt.trim());
    const dimensions = aspectRatioMap[aspectRatio] || aspectRatioMap["1:1"];

    const imageBlob = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: enhancedPrompt,
      parameters: {
        width: dimensions.width,
        height: dimensions.height,
      },
    });

    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    res.json({
      image: base64Image,
      originalPrompt: prompt,
      enhancedPrompt: enhancedPrompt,
    });
  } catch (error) {
    console.error("Generator Service Error:", error);
    res.status(500).json({ error: error.message || "Image generation failed" });
  }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`🎨 [Generator Service] Running on http://localhost:${PORT}`);
});
