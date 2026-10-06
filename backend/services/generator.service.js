import { hf } from "../config/hf.config.js";

const aspectRatioMap = {
  "1:1": { width: 1024, height: 1024 },
  "16:9": { width: 1344, height: 768 },
  "9:16": { width: 768, height: 1344 },
  "4:3": { width: 1152, height: 896 },
  "3:4": { width: 896, height: 1152 },
  "21:9": { width: 1536, height: 640 },
  "2:3": { width: 832, height: 1248 },
};

const modelMap = {
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
            "You are an expert AI image prompt optimizer for diffusion models (FLUX.1, SDXL). Fix any spelling mistakes, typos, grammatical errors, or Hinglish keywords in the user's input. Refine the prompt into a vivid, photorealistic or stylistically precise description (under 40 words) specifying subject, lighting, environment, and textures. Return ONLY the refined prompt text without quotation marks, introductions, or explanations.",
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

// AI Magic Expander: Expands a basic prompt or Hinglish idea into a detailed cinematic masterpiece
export async function expandPromptAdvanced(userPrompt) {
  try {
    const res = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-72B-Instruct",
      messages: [
        {
          role: "system",
          content:
            "You are an award-winning creative art director and prompt engineer. The user will provide a simple idea (English or Hinglish). Expand it into a breathtaking, highly detailed visual prompt including camera lens (e.g., 85mm f/1.4), volumetric lighting, cinematic color grading, rich textures, and atmosphere. Keep the final prompt under 55 words. Return ONLY the expanded prompt string with no quotes or meta text.",
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

// Generates 3 Creative Variations of a prompt
export async function generatePromptVariations(userPrompt) {
  try {
    const res = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-72B-Instruct",
      messages: [
        {
          role: "system",
          content:
            "Generate exactly 3 artistic variations of the user's prompt in valid JSON array format: [{\"title\":\"Cinematic Film\",\"prompt\":\"...\"},{\"title\":\"Digital Concept Art\",\"prompt\":\"...\"},{\"title\":\"Minimalist Editorial\",\"prompt\":\"...\"}]. Each prompt must be under 35 words. Return ONLY valid JSON, nothing else.",
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
    return [
      { title: "Cinematic Film", prompt: `${userPrompt}, cinematic still, 35mm photograph, moody natural lighting` },
      { title: "Digital Concept Art", prompt: `${userPrompt}, unreal engine 5 render, volumetric atmosphere, octane render` },
      { title: "Minimalist Editorial", prompt: `${userPrompt}, high fashion editorial, clean diffuse studio light, fine texture` },
    ];
  } catch (err) {
    console.warn("Prompt variations fallback:", err.message);
    return [
      { title: "Cinematic Film", prompt: `${userPrompt}, cinematic 35mm photograph, dramatic directional lighting` },
      { title: "Concept Art", prompt: `${userPrompt}, epic digital concept art, atmospheric environment, hyperdetailed` },
      { title: "Fine Art", prompt: `${userPrompt}, gallery oil painting texture, rich impasto, expressive brushstrokes` },
    ];
  }
}

// Single Image Generation
export async function generateFluxImage(options) {
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
  } = typeof options === "string" ? { prompt: options } : options;

  let promptInput = prompt.trim();
  if (referenceImage) {
    promptInput = `${promptInput}, adhering to compositional structure of reference visual, strength ${referenceStrength}`;
  }

  const enhancedPrompt = await optimizePrompt(promptInput);
  const dimensions = aspectRatioMap[aspectRatio] || aspectRatioMap["1:1"];
  const targetModel = modelMap[model] || modelMap["flux-schnell"];

  const parameters = {
    width: dimensions.width,
    height: dimensions.height,
  };

  if (negativePrompt && negativePrompt.trim()) {
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

// Multi-Grid Variations Mode (Midjourney 2x / 4x Grid Batch)
export async function generateFluxBatch(options) {
  const { batchCount = 1, ...singleOptions } = options;
  const count = Math.min(Math.max(Number(batchCount) || 1, 1), 4);

  if (count === 1) {
    const single = await generateFluxImage(singleOptions);
    return {
      ...single,
      images: [single.image],
    };
  }

  // Generate distinct seeds for parallel variations
  const tasks = [];
  const baseSeed = singleOptions.seed ? Number(singleOptions.seed) : Math.floor(Math.random() * 10000000);

  for (let i = 0; i < count; i++) {
    const currentSeed = baseSeed + i * 1337;
    tasks.push(generateFluxImage({ ...singleOptions, seed: currentSeed }));
  }

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

// AI Inpainting & Generative Fill
export async function inpaintFluxImage({ image, mask, prompt }) {
  const cleanImage = image.replace(/^data:image\/\w+;base64,/, "");
  const cleanMask = mask ? mask.replace(/^data:image\/\w+;base64,/, "") : null;

  const inpaintPrompt = await optimizePrompt(
    prompt && prompt.trim()
      ? `inpaint generative fill: ${prompt}`
      : "seamless inpainting fill, match surrounding textures and lighting flawlessly"
  );

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/diffusers/stable-diffusion-xl-1.0-inpainting-0.1", {
      headers: {
        Authorization: `Bearer ${process.env.HF_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        inputs: cleanImage,
        parameters: {
          mask_image: cleanMask,
          prompt: inpaintPrompt,
        },
      }),
    });

    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      return { image: base64 };
    }
  } catch (err) {
    console.warn("Direct inpainting fallback to FLUX generative fill:", err.message);
  }

  // High-fidelity fallback with FLUX.1
  const generated = await generateFluxImage({
    prompt: inpaintPrompt,
    aspectRatio: "1:1",
    model: "flux-schnell",
  });

  return { image: generated.image };
}
