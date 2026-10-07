import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import generateRoutes from "./routes/generate.js";
import toolsRoutes from "./routes/tools.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use(generateRoutes);
app.use(toolsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "An unexpected error occurred",
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`VividAI backend running on port ${PORT}`);
});