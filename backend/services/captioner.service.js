import { HF_TOKEN } from "../config/hf.config.js";

export async function generateCaption(base64Image) {
  const imageBuffer = Buffer.from(base64Image, "base64");

  const response = await fetch(
    "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large",
    {
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        "Content-Type": "application/octet-stream",
      },
      method: "POST",
      body: imageBuffer,
    }
  );

  if (!response.ok) {
    throw new Error(`HF BLIP error: ${response.statusText}`);
  }

  const result = await response.json();
  return result[0]?.generated_text || "A high quality artistic image";
}
