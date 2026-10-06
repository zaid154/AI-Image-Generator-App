import { HF_TOKEN } from "../config/hf.config.js";

export async function removeBackground(base64Image) {
  const imageBuffer = Buffer.from(base64Image, "base64");
  
  const response = await fetch(
    "https://api-inference.huggingface.co/models/briaai/RMBG-1.4",
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
    throw new Error(`HF RMBG error: ${response.statusText}`);
  }

  const resultBuffer = Buffer.from(await response.arrayBuffer());
  return resultBuffer.toString("base64");
}
