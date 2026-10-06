import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Microservice Route Modules
import generatorRoutes from "./routes/generator.routes.js";
import bgRemoverRoutes from "./routes/bgRemover.routes.js";
import upscalerRoutes from "./routes/upscaler.routes.js";
import captionerRoutes from "./routes/captioner.routes.js";

dotenv.config();

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Health Check Endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    services: {
      fluxGenerator: "online",
      bgRemover: "online",
      clarityUpscaler: "online",
      blipCaptioner: "online",
    },
    timestamp: new Date().toISOString(),
  });
});

// Mount Microservice Routes
app.use(generatorRoutes);
app.use(bgRemoverRoutes);
app.use(upscalerRoutes);
app.use(captionerRoutes);

// Server Activation
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 VividAI Microservice API running on Port ${PORT}`);
});