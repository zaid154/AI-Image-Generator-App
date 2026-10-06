import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

const GENERATOR_URL = process.env.GENERATOR_SERVICE_URL || "http://localhost:5002";
const BG_REMOVER_URL = process.env.BG_REMOVER_SERVICE_URL || "http://localhost:5003";
const UPSCALER_URL = process.env.UPSCALER_SERVICE_URL || "http://localhost:5004";
const CAPTIONER_URL = process.env.CAPTIONER_SERVICE_URL || "http://localhost:5005";

// Health Check for Gateway and Microservices
app.get("/health", async (req, res) => {
  const checkService = async (url) => {
    try {
      const resp = await fetch(`${url}/health`);
      return resp.ok ? "online" : "degraded";
    } catch {
      return "offline";
    }
  };

  const [generator, bgRemover, upscaler, captioner] = await Promise.all([
    checkService(GENERATOR_URL),
    checkService(BG_REMOVER_URL),
    checkService(UPSCALER_URL),
    checkService(CAPTIONER_URL),
  ]);

  res.json({
    gateway: "online",
    services: {
      imageGenerator: generator,
      bgRemover: bgRemover,
      upscaler: upscaler,
      captioner: captioner,
    },
    timestamp: new Date().toISOString(),
  });
});

// Proxy helper
async function proxyRequest(targetUrl, req, res) {
  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error(`Gateway proxy error to ${targetUrl}:`, error.message);
    res.status(502).json({
      error: `Downstream service unavailable at ${targetUrl}. Ensure microservice is running.`,
      details: error.message,
    });
  }
}

// Routes Routing to Respective Microservices
app.post("/generate-image", (req, res) => proxyRequest(`${GENERATOR_URL}/generate`, req, res));
app.post("/generate", (req, res) => proxyRequest(`${GENERATOR_URL}/generate`, req, res));

app.post("/remove-background", (req, res) => proxyRequest(`${BG_REMOVER_URL}/remove-bg`, req, res));
app.post("/remove-bg", (req, res) => proxyRequest(`${BG_REMOVER_URL}/remove-bg`, req, res));

app.post("/upscale-image", (req, res) => proxyRequest(`${UPSCALER_URL}/upscale`, req, res));
app.post("/upscale", (req, res) => proxyRequest(`${UPSCALER_URL}/upscale`, req, res));

app.post("/caption-image", (req, res) => proxyRequest(`${CAPTIONER_URL}/caption`, req, res));
app.post("/caption", (req, res) => proxyRequest(`${CAPTIONER_URL}/caption`, req, res));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`⚡ [API Gateway] Running on http://localhost:${PORT}`);
});
