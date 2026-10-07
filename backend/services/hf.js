import dotenv from "dotenv";
import { HfInference } from "@huggingface/inference";

dotenv.config();

const token = process.env.HF_ACCESS_TOKEN;
if (!token || token === "your_huggingface_access_token_here") {
  console.warn("HF_ACCESS_TOKEN is missing or not configured in backend/.env");
}

export const hf = new HfInference(token);

const ASPECT_RATIO_MAP = {
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1344, height: 768 },
  "9:16": { width: 768, height: 1344 },
  "4:3": { width: 1152, height: 896 },
  "3:4": { width: 896, height: 1152 },
  "21:9": { width: 1536, height: 640 },
  "2:3": { width: 832, height: 1248 },
};

const MODEL_MAP = {
  "flux-schnell": "black-forest-labs/FLUX.1-schnell",
  "sdxl": "stabilityai/stable-diffusion-xl-base-1.0",
  "anime": "cagliostrolab/animagine-xl-3.1",
};

export async function optimizePrompt(userPrompt) {
  try {
    const res = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-72B-Instruct",
      messages: [
        {
          role: "system",
          content:
            "Refine the user's prompt into a vivid, stylistically precise description (under 40 words) specifying subject, lighting, environment, and textures for diffusion models. Return ONLY the refined prompt text without quotes or explanations.",
        },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 90,
    });
    return res.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, "") || userPrompt;
  } catch (err) {
    console.warn("Prompt optimization fallback:", err.message);
    return userPrompt;
  }
}

export async function expandPrompt(userPrompt) {
  try {
    const res = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-72B-Instruct",
      messages: [
        {
          role: "system",
          content:
            "Expand the user's idea into a detailed, creative visual prompt with camera optics, volumetric lighting, rich textures, and atmosphere (under 55 words). Return ONLY the expanded prompt string with no quotes or meta text.",
        },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 120,
    });
    return res.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, "") || userPrompt;
  } catch (err) {
    console.warn("Expand prompt fallback:", err.message);
    return userPrompt;
  }
}

export async function getPromptVariations(userPrompt) {
  try {
    const res = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-72B-Instruct",
      messages: [
        {
          role: "system",
          content:
            "Generate exactly 3 artistic variations of the user's prompt as a JSON array: [{\"style\":\"Cinematic Film\",\"prompt\":\"...\"},{\"style\":\"Digital Concept Art\",\"prompt\":\"...\"},{\"style\":\"Minimalist Editorial\",\"prompt\":\"...\"}]. Each prompt under 35 words. Return ONLY valid JSON.",
        },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 220,
    });

    const raw = res.choices[0]?.message?.content?.trim() || "";
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    console.warn("Prompt variations fallback:", err.message);
  }

  return [
    { style: "Cinematic Film", prompt: `${userPrompt}, cinematic 35mm photograph, moody natural lighting` },
    { style: "Digital Concept Art", prompt: `${userPrompt}, unreal engine 5 render, volumetric atmosphere, octane render` },
    { style: "Minimalist Editorial", prompt: `${userPrompt}, high fashion editorial, clean diffuse studio light, fine texture` },
  ];
}

export async function generateSingleImage(options) {
  const {
    prompt,
    negativePrompt = "",
    aspectRatio = "1:1",
    model = "flux-schnell",
    seed,
    guidanceScale,
    numInferenceSteps,
    referenceImage,
    referenceStrength = 0.5,
  } = options;

  let promptInput = prompt.trim();
  if (referenceImage) {
    promptInput = `${promptInput}, adhering to compositional structure of reference visual, strength ${referenceStrength}`;
  }

  const enhancedPrompt = await optimizePrompt(promptInput);
  const dimensions = ASPECT_RATIO_MAP[aspectRatio] || ASPECT_RATIO_MAP["1:1"];
  const targetModel = MODEL_MAP[model] || MODEL_MAP["flux-schnell"];

  const parameters = {
    width: dimensions.width,
    height: dimensions.height,
  };

  if (negativePrompt?.trim()) {
    parameters.negative_prompt = negativePrompt.trim();
  }
  if (seed && !isNaN(Number(seed))) {
    parameters.seed = Number(seed);
  }
  if (guidanceScale && !isNaN(Number(guidanceScale))) {
    parameters.guidance_scale = Number(guidanceScale);
  }
  if (numInferenceSteps && !isNaN(Number(numInferenceSteps))) {
    parameters.num_inference_steps = Math.min(Number(numInferenceSteps), 30);
  }

  const startTime = Date.now();
  const imageBlob = await hf.textToImage({
    model: targetModel,
    inputs: enhancedPrompt,
    parameters,
  });

  const durationMs = Date.now() - startTime;
  const arrayBuffer = await imageBlob.arrayBuffer();
  const base64Image = Buffer.from(arrayBuffer).toString("base64");

  return {
    image: base64Image,
    originalPrompt: prompt,
    enhancedPrompt,
    aspectRatio,
    model: targetModel,
    seed: parameters.seed || Math.floor(Math.random() * 10000000),
    dimensions,
    durationMs,
  };
}

export async function generateBatchImages(options) {
  const count = Math.min(Math.max(Number(options.batchCount) || 1, 1), 4);
  if (count === 1) {
    const single = await generateSingleImage(options);
    return { ...single, images: [single.image] };
  }

  const baseSeed = options.seed ? Number(options.seed) : Math.floor(Math.random() * 10000000);
  const tasks = Array.from({ length: count }, (_, i) =>
    generateSingleImage({ ...options, seed: baseSeed + i * 1337 })
  );

  const results = await Promise.all(tasks);
  return {
    image: results[0].image,
    images: results.map((r) => r.image),
    results,
    originalPrompt: results[0].originalPrompt,
    enhancedPrompt: results[0].enhancedPrompt,
    aspectRatio: results[0].aspectRatio,
    model: results[0].model,
    seed: baseSeed,
    dimensions: results[0].dimensions,
    durationMs: results.reduce((acc, r) => acc + r.durationMs, 0),
  };
}

export async function inpaintImage({ image, mask, prompt }) {
  const cleanImage = image.replace(/^data:image\/\w+;base64,/, "");
  const cleanMask = mask ? mask.replace(/^data:image\/\w+;base64,/, "") : null;
  const inpaintPrompt = await optimizePrompt(
    prompt?.trim() ? `inpaint generative fill: ${prompt}` : "seamless inpainting fill, matching textures and lighting"
  );

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/diffusers/stable-diffusion-xl-1.0-inpainting-0.1", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: cleanImage,
        parameters: { mask_image: cleanMask, prompt: inpaintPrompt },
      }),
    });

    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      return { image: Buffer.from(arrayBuffer).toString("base64") };
    }
  } catch (err) {
    console.warn("Direct inpainting fallback to FLUX:", err.message);
  }

  const fallback = await generateSingleImage({
    prompt: inpaintPrompt,
    aspectRatio: "1:1",
    model: "flux-schnell",
  });
  return { image: fallback.image };
}

export async function removeBackground(base64Image) {
  const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), "base64");
  const response = await fetch("https://api-inference.huggingface.co/models/briaai/RMBG-1.4", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
    },
    method: "POST",
    body: buffer,
  });

  if (!response.ok) {
    throw new Error(`RMBG model error: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

export async function upscaleImage(base64Image) {
  const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), "base64");
  const response = await fetch("https://api-inference.huggingface.co/models/philz1337x/clarity-upscaler", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
    },
    method: "POST",
    body: buffer,
  });

  if (!response.ok) {
    throw new Error(`Clarity upscaler error: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer).toString("base64");
}

export async function captionImage(base64Image) {
  const buffer = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""), "base64");
  const response = await fetch("https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream",
    },
    method: "POST",
    body: buffer,
  });

  if (!response.ok) {
    throw new Error(`BLIP model error: ${response.statusText}`);
  }

  const result = await response.json();
  return result[0]?.generated_text || "A high quality artistic image";
}
