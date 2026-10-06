import dotenv from "dotenv";
import { HfInference } from "@huggingface/inference";

dotenv.config();

if (!process.env.HF_ACCESS_TOKEN || process.env.HF_ACCESS_TOKEN === "your_huggingface_access_token_here") {
  console.warn("⚠️ Warning: HF_ACCESS_TOKEN is missing or not configured in backend/.env");
}

export const hf = new HfInference(process.env.HF_ACCESS_TOKEN);
export const HF_TOKEN = process.env.HF_ACCESS_TOKEN;
