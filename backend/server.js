import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { HfInference } from "@huggingface/inference";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const hf = new HfInference(process.env.HF_ACCESS_TOKEN);

// Helper function to auto-correct spelling and enhance prompt
async function enhancePrompt(userPrompt) {
  try {
    const res = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-72B-Instruct",
      messages: [
        {
          role: "system",
          content:
            "You are an expert AI image prompt optimizer. Fix all spelling mistakes, typos, grammatical errors, or Hinglish in the user input. Refine it into a vivid, descriptive prompt (under 45 words) with rich visual textures, lighting, and composition. If an airship/flying ship is requested, describe its ornate wooden galleon hull, billowing sails or vintage zeppelin balloon, spinning brass clockwork gears, and warm cinematic lighting. Return ONLY the refined prompt without quotes or preamble.",
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

app.post("/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.HF_ACCESS_TOKEN || process.env.HF_ACCESS_TOKEN === "your_huggingface_access_token_here") {
      return res.status(401).json({
        error: "HF_ACCESS_TOKEN is missing. Please add your free Hugging Face token in backend/.env",
      });
    }

    // Step 1: Auto-correct spelling and enhance prompt
    const enhancedPrompt = await enhancePrompt(prompt.trim());
    console.log(`Original: "${prompt}" -> Enhanced: "${enhancedPrompt}"`);

    // Step 2: Generate image using FLUX.1-schnell model
    const imageBlob = await hf.textToImage({
      model: "black-forest-labs/FLUX.1-schnell",
      inputs: enhancedPrompt,
    });

    // Convert Blob to Base64
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    res.json({
      image: base64Image,
      originalPrompt: prompt,
      enhancedPrompt: enhancedPrompt,
    });
  } catch (error) {
    console.error("Image generation error:", error);
    res.status(500).json({
      error: error.message || "Image generation failed",
    });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});