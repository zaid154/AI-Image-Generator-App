const API_BASE_URL = "http://localhost:5001";

export const api = {
  // Generate Image with FLUX.1 / SDXL / Anime
  async generateImage(params) {
    const payload = typeof params === "string" ? { prompt: params } : params;
    const res = await fetch(`${API_BASE_URL}/generate-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.image) {
      throw new Error(data.error || "Image generation failed");
    }
    return data;
  },

  // AI Magic Expander: Expands simple prompt into rich visual description
  async expandPrompt(prompt) {
    const res = await fetch(`${API_BASE_URL}/expand-prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (!res.ok || !data.expandedPrompt) {
      throw new Error(data.error || "Failed to expand prompt");
    }
    return data.expandedPrompt;
  },

  // Prompt Variations: Generates 3 creative styles for the prompt
  async getPromptVariations(prompt) {
    const res = await fetch(`${API_BASE_URL}/prompt-variations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    if (!res.ok || !data.variations) {
      throw new Error(data.error || "Failed to generate variations");
    }
    return data.variations;
  },

  // Remove Background with RMBG 1.4
  async removeBackground(base64Image) {
    const clean = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const res = await fetch(`${API_BASE_URL}/remove-background`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: clean }),
    });
    const data = await res.json();
    if (!res.ok || !data.image) {
      throw new Error(data.error || "Background removal failed");
    }
    return data;
  },

  // Upscale Image with Clarity AI
  async upscaleImage(base64Image) {
    const clean = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const res = await fetch(`${API_BASE_URL}/upscale-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: clean }),
    });
    const data = await res.json();
    if (!res.ok || !data.image) {
      throw new Error(data.error || "Image upscaling failed");
    }
    return data;
  },

  // Extract Prompt Caption with BLIP AI
  async captionImage(base64Image) {
    const clean = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const res = await fetch(`${API_BASE_URL}/caption-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: clean }),
    });
    const data = await res.json();
    if (!res.ok || !data.caption) {
      throw new Error(data.error || "Prompt extraction failed");
    }
    return data;
  },

  // Health Check
  async checkHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    return await res.json();
  },
};

export default api;
