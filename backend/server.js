import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/generate-image", async (req, res) => {

  try {

    const { prompt } = req.body;

    const response = await openai.responses.create({
      model: "gpt-5.5",
      input: prompt,
      tools: [{ type: "image_generation" }],
    });

    const imageData = response.output
      .filter((output) => output.type === "image_generation_call")
      .map((output) => output.result);

    res.json({
      image: imageData[0],
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Image generation failed",
    });
  }
});

app.listen(5000, () => {
  console.log("Server Running on Port 5000");
});