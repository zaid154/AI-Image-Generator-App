const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

async function post(endpoint, body) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }
  return data;
}

export const api = {
  async generateImage(params) {
    const payload = typeof params === "string" ? { prompt: params } : params;
    return post("/generate-image", payload);
  },

  async inpaintImage({ image, mask, prompt }) {
    const cleanImage = image.replace(/^data:image\/\w+;base64,/, "");
    const cleanMask = mask ? mask.replace(/^data:image\/\w+;base64,/, "") : null;
    return post("/inpaint-image", { image: cleanImage, mask: cleanMask, prompt });
  },

  async expandPrompt(prompt) {
    const data = await post("/expand-prompt", { prompt });
    return data.expandedPrompt || prompt;
  },

  async getPromptVariations(prompt) {
    const data = await post("/prompt-variations", { prompt });
    return data.variations || [];
  },

  async removeBackground(base64Image) {
    const clean = base64Image.replace(/^data:image\/\w+;base64,/, "");
    return post("/remove-background", { image: clean });
  },

  async upscaleImage(base64Image) {
    const clean = base64Image.replace(/^data:image\/\w+;base64,/, "");
    return post("/upscale-image", { image: clean });
  },

  async captionImage(base64Image) {
    const clean = base64Image.replace(/^data:image\/\w+;base64,/, "");
    return post("/caption-image", { image: clean });
  },

  async checkHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    return res.json();
  },
};

export default api;
