import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, Check, ArrowRight } from "lucide-react";

const formulaExamples = [
  {
    step: "1. Subject",
    title: "Central Subject",
    desc: "Define the core figure, object, or character with specific textures and materials.",
    example: "Mechanical cybernetic owl with intricate clockwork brass gears and glowing cobalt eyes",
    fullPrompt: "Mechanical cybernetic owl with intricate clockwork brass gears, perched on a weathered mossy branch, foggy twilight atmosphere, photorealistic 8k macro photography"
  },
  {
    step: "2. Environment",
    title: "Atmospheric Setting",
    desc: "Specify geographic location, architecture, interior space, or weather condition.",
    example: "Perched on a misty tree branch inside a dense rain-soaked pine forest",
    fullPrompt: "Ancient stone temple partially submerged in emerald green swamp water, overgrown ivy, misty morning fog, sunlight filtering through canopy, 35mm film photography"
  },
  {
    step: "3. Lighting",
    title: "Lighting Design",
    desc: "Direct how light falls: direction, temperature, reflections, and shadow depth.",
    example: "Volumetric golden hour rim lighting, soft reflections on wet metallic feathers",
    fullPrompt: "Portrait of a ceramic tea bowl on raw dark slate, single directional warm studio beam, soft rim lighting, textured shadows, architectural minimalism"
  },
  {
    step: "4. Render Medium",
    title: "Optical Medium",
    desc: "State lens optics, camera type, or fine-art medium for consistent fidelity.",
    example: "Photorealistic 8k, Hasselblad 85mm medium format photography, f/1.8 depth of field",
    fullPrompt: "Scandinavian modern living room with floor-to-ceiling glass windows overlooking autumn birch forest, architectural digest photography, Hasselblad 85mm, soft diffuse light"
  }
];

const sections = [
  {
    title: "Lighting & Atmosphere",
    tags: [
      "Cinematic volumetric lighting",
      "Golden hour sunset glow",
      "Neon reflections on wet pavement",
      "Bioluminescent moody ambient glow",
      "Soft studio rim lighting",
      "Dramatic chiaroscuro shadows"
    ]
  },
  {
    title: "Camera & Optics",
    tags: [
      "85mm portrait lens, f/1.4 shallow bokeh",
      "Wide-angle 24mm architectural view",
      "Macro detailed close-up shot",
      "Low angle heroic perspective",
      "Top-down flatlay composition",
      "35mm vintage film grain texture"
    ]
  },
  {
    title: "Aesthetics & Render Engines",
    tags: [
      "Photorealistic 8k editorial photography",
      "Octane render, Ray-traced reflections",
      "High detailed textured digital concept art",
      "Studio Ghibli lush anime landscape",
      "Classic oil painting impasto brushwork",
      "Minimalist Scandinavian architectural design"
    ]
  },
  {
    title: "Mood & Palette",
    tags: [
      "Ethereal and dreamy twilight mood",
      "Moody dark noir high-contrast",
      "Vibrant energetic contemporary palette",
      "Calm monochromatic minimalism",
      "Warm earthy terracotta and sage",
      "Celestial astronomical deep space"
    ]
  }
];

const PromptGuide = ({ onSelectPrompt }) => {
  const [copiedTag, setCopiedTag] = useState(null);
  const navigate = useNavigate();

  const handleCopyTag = (tag) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const handleLoadFormulaPrompt = (prompt) => {
    if (onSelectPrompt) onSelectPrompt(prompt);
    navigate("/");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="max-w-2xl mb-10">
        <h1 className="text-2xl font-semibold text-white tracking-tight">Prompt Engineering Guide</h1>
        <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
          FLUX.1-schnell excels with natural language descriptions specifying subject, environment, lighting, and medium. Use the 4-part formula below or copy individual keywords to craft your visual prompt.
        </p>
      </div>

      {/* Anatomy Formula Card */}
      <div className="bg-zinc-900/30 border border-white/[0.06] rounded-xl p-6 mb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-semibold text-white">The 4-Part Prompt Architecture</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Click "Test prompt in Studio" on any column to load a complete production prompt.</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {formulaExamples.map((item, idx) => (
            <div key={idx} className="flex flex-col justify-between p-3.5 rounded-lg bg-zinc-950/40 border border-white/[0.04]">
              <div>
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                  {item.step}
                </span>
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{item.desc}</p>
                <p className="text-xs text-zinc-400 mt-2.5 p-2 rounded bg-black/40 border border-white/[0.04] italic">
                  "{item.example}"
                </p>
              </div>

              <button
                onClick={() => handleLoadFormulaPrompt(item.fullPrompt)}
                className="mt-4 flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors cursor-pointer pt-2 border-t border-white/[0.04]"
              >
                <span>Test prompt in Studio</span>
                <ArrowRight size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords Grid */}
      <div className="mb-12">
        <h2 className="text-base font-semibold text-white mb-2">Curated Modifier Keywords</h2>
        <p className="text-xs text-zinc-400 mb-6">Click any modifier tag to copy it to your clipboard for quick insertion into your prompt.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <div key={index} className="p-4 rounded-xl bg-zinc-900/20 border border-white/[0.05]">
              <h3 className="text-sm font-medium text-white mb-3">{section.title}</h3>
              <div className="flex flex-wrap gap-2">
                {section.tags.map((tag, tagIndex) => {
                  const isCopied = copiedTag === tag;
                  return (
                    <button
                      key={tagIndex}
                      onClick={() => handleCopyTag(tag)}
                      className="group bg-white/[0.04] border border-white/[0.06] rounded-md px-2.5 py-1 text-xs text-zinc-300 hover:text-white hover:border-white/[0.14] cursor-pointer flex items-center gap-1.5 transition-colors"
                      title="Click to copy modifier"
                    >
                      <span>{tag}</span>
                      {isCopied ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-zinc-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Launch CTA */}
      <div className="flex items-center gap-3 p-4 rounded-lg bg-zinc-900/30 border border-white/[0.06]">
        <span className="text-sm text-zinc-300">Ready to put these prompt techniques to work?</span>
        <button
          onClick={() => navigate("/")}
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors cursor-pointer flex items-center gap-1 ml-auto"
        >
          <span>Open Image Studio</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default PromptGuide;
