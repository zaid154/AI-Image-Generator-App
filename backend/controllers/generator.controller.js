import { 
  generateFluxBatch, 
  expandPromptAdvanced, 
  generatePromptVariations,
  inpaintFluxImage 
} from "../services/generator.service.js";

export async function handleGenerateImage(req, res) {
  try {
    const { 
      prompt, 
      negativePrompt, 
      aspectRatio = "1:1", 
      model = "flux-schnell", 
      seed, 
      guidanceScale, 
      numInferenceSteps,
      batchCount = 1,
      referenceImage,
      referenceStrength = 0.5
    } = req.body;

    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    if (!process.env.HF_ACCESS_TOKEN || process.env.HF_ACCESS_TOKEN === "your_huggingface_access_token_here") {
      return res.status(401).json({
        error: "HF_ACCESS_TOKEN is missing. Please add your free Hugging Face token in backend/.env",
      });
    }

    const result = await generateFluxBatch({
      prompt,
      negativePrompt,
      aspectRatio,
      model,
      seed,
      guidanceScale,
      numInferenceSteps,
      batchCount,
      referenceImage,
      referenceStrength,
    });

    res.json(result);
  } catch (error) {
    console.error("Generator Controller error:", error);
    res.status(500).json({ error: error.message || "Image generation failed" });
  }
}

export async function handleExpandPrompt(req, res) {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required to expand" });
    }
    const expanded = await expandPromptAdvanced(prompt);
    res.json({ expandedPrompt: expanded });
  } catch (error) {
    console.error("Expand Prompt error:", error);
    res.status(500).json({ error: error.message || "Prompt expansion failed" });
  }
}

export async function handlePromptVariations(req, res) {
  try {
    const { prompt } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt is required for variations" });
    }
    const variations = await generatePromptVariations(prompt);
    res.json({ variations });
  } catch (error) {
    console.error("Prompt Variations error:", error);
    res.status(500).json({ error: error.message || "Variations generation failed" });
  }
}

export async function handleInpaintImage(req, res) {
  try {
    const { image, mask, prompt } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Source image is required for inpainting" });
    }

    const result = await inpaintFluxImage({ image, mask, prompt });
    res.json(result);
  } catch (error) {
    console.error("Inpaint Image error:", error);
    res.status(500).json({ error: error.message || "Inpainting generation failed" });
  }
}
