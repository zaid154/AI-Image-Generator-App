export const samplePrompts = [
  "Architectural interior of a minimalist concrete pavilion with indoor reflective pool, morning sunlight beam",
  "Macro photography of an iridescent emerald beetle on morning dew-covered moss, 85mm lens f/2.8",
  "Studio portrait of an elderly artisan repairing vintage brass clockwork gears, warm focused task light",
  "Nordic coastal fjord at dusk with calm turquoise water reflecting snow-dusted granite peaks",
  "Cybernetic cyber-samurai standing in a rainy Tokyo alley with neon reflections and holographic visor",
  "Ceramic handcrafted matcha bowl resting on dark textured slate stone, Japanese wabi-sabi lighting",
  "Ethereal bioluminescent jellyfish floating through a deep celestial ocean under starlight",
  "Majestic snow leopard perched on Himalayan mountain ridge at golden hour, photorealistic 8k",
  "Vintage 1970s retro-futuristic space station lounge with warm orange leather chairs and starfield view"
];

export const stylePresets = [
  { id: "none", name: "Natural", promptSuffix: "" },
  { id: "cinematic", name: "Cinematic", promptSuffix: ", cinematic film still, moody directional lighting, shallow depth of field, 35mm photograph" },
  { id: "editorial", name: "Editorial", promptSuffix: ", high-fashion editorial studio photography, soft diffuse key light, fine texture" },
  { id: "anime", name: "Anime", promptSuffix: ", Studio Ghibli inspired anime illustration, clean lineart, vibrant watercolor background" },
  { id: "3d", name: "3D Render", promptSuffix: ", clean 3D digital render, soft clay materials, subtle ray-traced shadows, Octane render" },
  { id: "oil", name: "Oil Painting", promptSuffix: ", classical impasto oil on canvas, expressive textured brushwork, rich shadows" },
  { id: "cyberpunk", name: "Cyberpunk", promptSuffix: ", neon-drenched cyberpunk aesthetic, chromatic aberration, reflective wet pavement, synthwave glow" },
  { id: "watercolor", name: "Watercolor", promptSuffix: ", delicate watercolor wash, fluid translucent pigment bleeds, handmade cotton paper texture" },
  { id: "vintage", name: "Vintage 70s", promptSuffix: ", vintage 1970s Kodachrome film photograph, warm analog grain, muted pastel tones, retro exposure" },
  { id: "dark-fantasy", name: "Dark Fantasy", promptSuffix: ", dark fantasy aesthetic, gothic architecture, misty ethereal moonlight, dramatic chiaroscuro" },
  { id: "isometric", name: "Isometric 3D", promptSuffix: ", miniature isometric 3D diorama, clean tilt-shift macro lens, soft ambient occlusion, cute detailed props" },
  { id: "polaroid", name: "Polaroid", promptSuffix: ", authentic vintage Polaroid instant photo, soft flash illumination, light leaks, nostalgic film border" }
];

export const aspectRatios = [
  { id: "1:1", label: "1:1", name: "Square", platform: "Post" },
  { id: "16:9", label: "16:9", name: "Landscape", platform: "YouTube" },
  { id: "9:16", label: "9:16", name: "Portrait", platform: "Reel/Story" },
  { id: "4:3", label: "4:3", name: "Classic", platform: "Photo" },
  { id: "3:4", label: "3:4", name: "Vertical", platform: "Pin" },
  { id: "21:9", label: "21:9", name: "Cinematic", platform: "Banner" },
  { id: "2:3", label: "2:3", name: "Poster", platform: "Print" },
];

export const modelsList = [
  { id: "flux-schnell", name: "FLUX.1 Schnell", badge: "Fastest · 8K", desc: "Supreme prompt adherence & photorealism" },
  { id: "sdxl", name: "Stable Diffusion XL", badge: "Artistic", desc: "Classic SDXL with rich atmospheric textures" },
  { id: "anime", name: "Animagine XL 3.1", badge: "Anime / Ghibli", desc: "Fine-tuned for Japanese animation art" },
];

export const STORAGE_VAULT_KEY = "vivid_ai_generation_vault_v3";
export const STORAGE_ACTIVE_IMAGE_KEY = "vivid_ai_active_image";
export const STORAGE_ACTIVE_PROMPT_KEY = "vivid_ai_active_prompt";
export const STORAGE_COLLECTIONS_KEY = "vivid_ai_collections_v1";
