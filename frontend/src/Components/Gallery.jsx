import React, { useState } from 'react';
import { Copy, Check, ArrowRight } from 'lucide-react';

import img1 from "./Assets/claraundben-ai-generated-8622236_1920.jpg";
import img2 from "./Assets/enchanted-forest-bridge-background.jpg";
import img3 from "./Assets/jsjcreationsmm-ai-generated-8253173_1920.jpg";
import img4 from "./Assets/majestic-mountain-peak-dusk-enchanting-travel-destination-generative-ai.jpg";
import img5 from "./Assets/ralph_germany-ai-generated-8321924_1920.jpg";
import img6 from "./Assets/sabrinabelle-girl-9271710_1920.jpg";

const galleryItems = [
  { id: 1, title: "Tribal Warrior Queen", prompt: "Ultra close-up portrait of a young woman with piercing blue-grey eyes, small golden nose ring, ornate golden headpiece with turquoise gemstone, freckled sun-kissed skin, messy brown hair, intense gaze, dramatic studio lighting, hyper-detailed skin texture, 85mm macro lens, photorealistic 8k.", category: "Portraits", image: img1, likes: 1240 },
  { id: 2, title: "Enchanted Forest Bridge", prompt: "Ancient mossy stone arch bridge over a calm glowing river in an enchanted forest, golden sunlight rays streaming through autumn leaves, orange wildflowers blooming on both banks, misty magical atmosphere, fairy-tale fantasy landscape.", category: "Fantasy", image: img2, likes: 3410 },
  { id: 3, title: "Moonlit Victorian Girl", prompt: "Beautiful young woman with long wavy brown hair wearing a delicate vintage lace dress, standing under a glowing full moon in a dreamy night sky, soft romantic lighting, ethereal atmosphere, digital painting, Pre-Raphaelite style.", category: "Portraits", image: img3, likes: 2890 },
  { id: 4, title: "Dramatic Coastal Cliffs", prompt: "Breathtaking dramatic coastal landscape with towering rocky cliffs, crystal clear turquoise ocean water, secluded sandy beach, colorful moss and wildflowers on rocky terrain, birds flying in hazy sky, cinematic wide-angle photography.", category: "Landscapes", image: img4, likes: 1980 },
  { id: 5, title: "Father's Tender Embrace", prompt: "Heartwarming portrait of a bearded young father in a white sweater lovingly holding his smiling baby, soft golden backlight creating a warm glowing halo effect, emotional family moment, shallow depth of field, photorealistic.", category: "Portraits", image: img5, likes: 2150 },
  { id: 6, title: "Fallen Angel in Rain", prompt: "Ethereal angel girl with large white feathered wings wearing a flowing white dress, sitting on a stone ledge near crashing water, hair in a messy bun, dramatic cloudy sky with sunlight breaking through, rain drops, cinematic fantasy art.", category: "Fantasy", image: img6, likes: 4520 },
];

const categories = ["All", "Portraits", "Fantasy", "Landscapes"];

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [copiedId, setCopiedId] = useState(null);

  const filteredItems = activeCategory === "All" 
    ? galleryItems 
    : galleryItems.filter(item => item.category === activeCategory);

  const handleCopyPrompt = (id, prompt) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Gallery</h1>
        <p className="text-sm text-zinc-500 mt-1">Explore creations by the community.</p>
      </div>

      <div className="flex items-center gap-4 mb-8 border-b border-white/[0.06] pb-4 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`text-sm px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
              activeCategory === category
                ? "bg-white/[0.06] text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div 
            key={item.id} 
            className="rounded-lg overflow-hidden bg-zinc-900/30 border border-white/[0.06] hover:border-white/[0.12] transition-colors relative group"
          >
            <div className="relative">
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full aspect-[4/3] object-cover" 
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-[10px] text-zinc-300 px-2 py-0.5 rounded">
                {item.category}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-sm font-medium text-white">{item.title}</h3>
              <p className="text-xs text-zinc-500 line-clamp-2 mt-1">
                {item.prompt}
              </p>
              
              <div className="mt-4 flex items-center gap-4">
                <button 
                  onClick={() => handleCopyPrompt(item.id, item.prompt)}
                  className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-white transition-colors"
                >
                  {copiedId === item.id ? (
                    <Check size={14} className="text-green-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                  <span>{copiedId === item.id ? "Copied" : "Copy prompt"}</span>
                </button>
                <button className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors ml-auto">
                  <span>Remix</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Gallery;
