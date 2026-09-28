import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

const sections = [
  {
    title: "Lighting & Atmosphere",
    tags: [
      "Cinematic volumetric lighting",
      "Golden hour sunset glow",
      "Neon cyberpunk reflections",
      "Bioluminescent moody glow",
      "Soft studio rim lighting",
      "Dramatic chiaroscuro shadows"
    ]
  },
  {
    title: "Camera & Optics",
    tags: [
      "85mm portrait lens, f/1.4 bokeh",
      "Wide-angle panoramic landscape",
      "Macro detailed close-up shot",
      "Low angle heroic perspective",
      "Drone aerial bird-eye view",
      "35mm vintage film grain photography"
    ]
  },
  {
    title: "Aesthetics & Render Engines",
    tags: [
      "Photorealistic 8k, Unreal Engine 5",
      "Octane render, Ray tracing",
      "High detailed textured digital art",
      "Studio Ghibli lush anime aesthetic",
      "Classic oil painting by old masters",
      "Futuristic sci-fi concept art"
    ]
  },
  {
    title: "Mood & Vibe",
    tags: [
      "Ethereal and dreamy fantasy",
      "Dark moody noir atmosphere",
      "Vibrant energetic futuristic",
      "Calm minimalist aesthetic",
      "Retro nostalgic 1980s synthwave",
      "Epic mystical celestial grandeur"
    ]
  }
];

const PromptGuide = ({ onSelectPrompt, setActiveTab }) => {
  const [copiedTag, setCopiedTag] = useState(null);

  const handleCopyTag = (tag) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const handleApplySample = (prompt) => {
    if (onSelectPrompt) onSelectPrompt(prompt);
    setActiveTab("generator");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="max-w-2xl mb-12">
        <h1 className="text-2xl font-semibold text-white">Prompt Guide</h1>
        <p className="text-sm text-zinc-500 mt-2">
          Learn how to get the most breathtaking results from FLUX.1. Click any keyword below to copy or use in the studio.
        </p>
      </div>

      {/* Anatomy Formula Card */}
      <div className="bg-zinc-900/30 border border-white/[0.06] rounded-lg p-6 mb-12">
        <h3 className="text-lg font-medium text-white mb-6">The Prompt Formula</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <span className="text-xs text-zinc-500 uppercase block mb-1">1. Subject</span>
            <p className="text-sm text-zinc-300">What is the central focus?</p>
            <p className="text-xs text-zinc-500 mt-1 italic">e.g. "A mechanical cybernetic owl with glowing blue eyes"</p>
          </div>
          <div>
            <span className="text-xs text-zinc-500 uppercase block mb-1">2. Environment</span>
            <p className="text-sm text-zinc-300">Where is it located?</p>
            <p className="text-xs text-zinc-500 mt-1 italic">e.g. "perched on a misty tree branch in a rainy neon city"</p>
          </div>
          <div>
            <span className="text-xs text-zinc-500 uppercase block mb-1">3. Lighting</span>
            <p className="text-sm text-zinc-300">How is it lit?</p>
            <p className="text-xs text-zinc-500 mt-1 italic">e.g. "rim lighting, neon reflections on wet metallic feathers"</p>
          </div>
          <div>
            <span className="text-xs text-zinc-500 uppercase block mb-1">4. Render Style</span>
            <p className="text-sm text-zinc-300">What is the visual medium?</p>
            <p className="text-xs text-zinc-500 mt-1 italic">e.g. "photorealistic 8k, Octane Render, cinematic photography"</p>
          </div>
        </div>
      </div>

      {/* Keywords Power-Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {sections.map((section, index) => (
          <div key={index}>
            <h4 className="text-sm font-medium text-white mb-3">{section.title}</h4>
            <div className="flex flex-wrap gap-2">
              {section.tags.map((tag, tagIndex) => {
                const isCopied = copiedTag === tag;
                return (
                  <button
                    key={tagIndex}
                    onClick={() => handleCopyTag(tag)}
                    className="group bg-white/[0.04] border border-white/[0.06] rounded-md px-2.5 py-1 text-xs text-zinc-400 hover:text-white hover:border-white/[0.12] cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <span>{tag}</span>
                    {isCopied ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : (
                      <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Launch CTA */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-400">Ready to create?</span>
        <button
          onClick={() => setActiveTab("generator")}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors cursor-pointer"
        >
          Open Image Studio
        </button>
      </div>
    </div>
  );
};

export default PromptGuide;
