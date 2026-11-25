import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, ArrowRight } from "lucide-react";

import img1 from "../assets/gallery/claraundben-ai-generated-8622236_1920.jpg";
import img2 from "../assets/gallery/enchanted-forest-bridge-background.jpg";
import img3 from "../assets/gallery/jsjcreationsmm-ai-generated-8253173_1920.jpg";
import img4 from "../assets/gallery/majestic-mountain-peak-dusk-enchanting-travel-destination-generative-ai.jpg";
import img5 from "../assets/gallery/ralph_germany-ai-generated-8321924_1920.jpg";
import img6 from "../assets/gallery/sabrinabelle-girl-9271710_1920.jpg";

const galleryItems = [
  {
    id: 1,
    title: "Tribal Warrior Queen",
    prompt: "Ultra close-up portrait of a young woman with piercing blue-grey eyes, small golden nose ring, ornate golden headpiece with turquoise gemstone, freckled sun-kissed skin, messy brown hair, intense gaze, dramatic studio lighting, hyper-detailed skin texture, 85mm macro lens, photorealistic 8k.",
    category: "Portraits",
    image: img1
  },
  {
    id: 2,
    title: "Enchanted Forest Bridge",
    prompt: "Ancient mossy stone arch bridge over a calm glowing river in an enchanted forest, golden sunlight rays streaming through autumn leaves, orange wildflowers blooming on both banks, misty magical atmosphere, fairy-tale fantasy landscape.",
    category: "Fantasy",
    image: img2
  },
  {
    id: 3,
    title: "Moonlit Victorian Girl",
    prompt: "Beautiful young woman with long wavy brown hair wearing a delicate vintage lace dress, standing under a glowing full moon in a dreamy night sky, soft romantic lighting, ethereal atmosphere, digital painting, Pre-Raphaelite style.",
    category: "Portraits",
    image: img3
  },
  {
    id: 4,
    title: "Dramatic Coastal Cliffs",
    prompt: "Breathtaking dramatic coastal landscape with towering rocky cliffs, crystal clear turquoise ocean water, secluded sandy beach, colorful moss and wildflowers on rocky terrain, birds flying in hazy sky, cinematic wide-angle photography.",
    category: "Landscapes",
    image: img4
  },
  {
    id: 5,
    title: "Father's Tender Embrace",
    prompt: "Heartwarming portrait of a bearded young father in a white sweater lovingly holding his smiling baby, soft golden backlight creating a warm glowing halo effect, emotional family moment, shallow depth of field, photorealistic.",
    category: "Portraits",
    image: img5
  },
  {
    id: 6,
    title: "Fallen Angel in Rain",
    prompt: "Ethereal angel girl with large white feathered wings wearing a flowing white dress, sitting on a stone ledge near crashing water, hair in a messy bun, dramatic cloudy sky with sunlight breaking through, rain drops, cinematic fantasy art.",
    category: "Fantasy",
    image: img6
  },
];

const categories = ["All", "Portraits", "Fantasy", "Landscapes"];

const Gallery = ({ onSelectPrompt }) => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [copiedId, setCopiedId] = useState(null);
  const navigate = useNavigate();

  const filteredItems = activeCategory === "All" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  const handleCopyPrompt = (id, prompt) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRemix = (prompt) => {
    if (onSelectPrompt) onSelectPrompt(prompt);
    navigate("/");
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Showcase Gallery</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Curated community generations produced with FLUX.1. Click "Remix in Studio" to load any prompt directly into your workstation.
        </p>
      </div>

      {/* Category filter bar */}
      <div className="flex items-center gap-2 mb-8 border-b border-white/[0.06] pb-4 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`text-xs sm:text-sm px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeCategory === category
                ? "bg-white/[0.08] text-white font-medium"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className="rounded-lg overflow-hidden bg-zinc-900/30 border border-white/[0.06] hover:border-white/[0.14] transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover" 
                  loading="lazy"
                />
                <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-sm text-[11px] font-medium text-zinc-300 px-2 py-0.5 rounded">
                  {item.category}
                </div>
              </div>
              
              <div className="p-4">
                <h2 className="text-sm font-semibold text-white">{item.title}</h2>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1.5 leading-relaxed">
                  {item.prompt}
                </p>
              </div>
            </div>

            <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-white/[0.04]">
              <button 
                onClick={() => handleCopyPrompt(item.id, item.prompt)}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                title="Copy prompt text"
              >
                {copiedId === item.id ? (
                  <Check size={14} className="text-emerald-400" />
                ) : (
                  <Copy size={14} />
                )}
                <span>{copiedId === item.id ? "Copied" : "Copy prompt"}</span>
              </button>
              
              <button 
                onClick={() => handleRemix(item.prompt)}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer"
                title="Open this prompt in Studio to customize"
              >
                <span>Remix in Studio</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
