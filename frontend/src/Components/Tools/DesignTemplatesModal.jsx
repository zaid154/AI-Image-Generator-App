import React, { useState } from "react";
import { 
  X, Sparkles, Type, Check, ArrowRight, Tag, Tv, 
  Shirt, Film, Palette, CheckCircle2 
} from "lucide-react";

const designCategories = [
  {
    id: "logos",
    title: "Logos & Monograms",
    icon: <Tag size={15} />,
    aspectRatio: "1:1",
    templates: [
      {
        id: "logo_minimal",
        name: "Minimalist Geometric Logo",
        desc: "Clean geometric emblem with elegant modern typography",
        promptPattern: (title, subtitle) =>
          `minimalist vector logo design featuring modern geometric emblem and bold clean typography "${title || "NEXUS"}"${subtitle ? ` with subtitle "${subtitle}"` : ""}, vector aesthetic, golden ratio symmetry, flat colors, isolated on crisp dark background`,
      },
      {
        id: "logo_vintage",
        name: "Vintage Monogram Badge",
        desc: "Classic heritage circular emblem with engraved typography",
        promptPattern: (title, subtitle) =>
          `vintage circular heritage badge logo with ornate filigree, engraved banner text reading "${title || "HERITAGE"}"${subtitle ? ` and "${subtitle}"` : ""}, rustic aesthetic, gold foil and deep charcoal, letterpress texture`,
      },
      {
        id: "logo_esports",
        name: "Cyberpunk Mascot Logo",
        desc: "High-octane esports gaming shield mascot with neon text",
        promptPattern: (title, subtitle) =>
          `fierce cybernetic wolf esports mascot logo with sharp angular shield, bold aggressive typography "${title || "VORTEX"}"${subtitle ? ` with subtitle "${subtitle}"` : ""}, electric cyan and magenta neon rim lighting, vector graphic`,
      },
    ],
  },
  {
    id: "thumbnails",
    title: "YouTube Thumbnails & Banners",
    icon: <Tv size={15} />,
    aspectRatio: "16:9",
    templates: [
      {
        id: "thumb_tech",
        name: "High-CTR Tech Review",
        desc: "Dramatic studio lighting with high-contrast bold 3D text",
        promptPattern: (title, subtitle) =>
          `high-CTR YouTube thumbnail of an intense presenter with expressive eyes looking at floating futuristic glowing holographic device, bold 3D extruded yellow and white text "${title || "THE FUTURE"}"${subtitle ? ` and "${subtitle}"` : ""}, dramatic rim light, 8k cinematic`,
      },
      {
        id: "thumb_cinema",
        name: "Cinematic Storytelling",
        desc: "Dark dramatic cinematic landscape with bold cinematic title",
        promptPattern: (title, subtitle) =>
          `cinematic wide-angle film still with epic scale, lone traveler on misty mountain cliff facing colossal celestial anomaly, massive cinematic typography "${title || "DISCOVERY"}"${subtitle ? ` with subtitle "${subtitle}"` : ""}, atmospheric volumetric lighting`,
      },
    ],
  },
  {
    id: "merch",
    title: "T-Shirt & Merch Prints",
    icon: <Shirt size={15} />,
    aspectRatio: "3:4",
    templates: [
      {
        id: "merch_retro",
        name: "Retro Synthwave Sunset",
        desc: "1980s neon grid sunset with distressed vintage typography",
        promptPattern: (title, subtitle) =>
          `vintage 1980s retro synthwave t-shirt illustration, glowing wireframe grid neon sunset with palm silhouettes, distressed typography reading "${title || "OUTRUN"}"${subtitle ? ` and "${subtitle}"` : ""}, screenprint halftones, isolated on dark background`,
      },
      {
        id: "merch_nature",
        name: "Botanical Nature Print",
        desc: "Organic wildflower botanical lineart with elegant serif font",
        promptPattern: (title, subtitle) =>
          `aesthetic botanical cottagecore t-shirt design, hand-drawn delicate wildflowers and crescent moon, elegant serif typography "${title || "BLOOM"}"${subtitle ? ` with quote "${subtitle}"` : ""}, minimalist linework, earthy muted tones`,
      },
    ],
  },
  {
    id: "posters",
    title: "Typography Posters & Ads",
    icon: <Film size={15} />,
    aspectRatio: "2:3",
    templates: [
      {
        id: "poster_swiss",
        name: "Swiss Style International Typography",
        desc: "Bauhaus / Swiss modernism with bold Helvetica layout",
        promptPattern: (title, subtitle) =>
          `Swiss International Style graphic design poster, striking geometric red and black abstract shapes, bold structured typography headline "${title || "DESIGN 2026"}"${subtitle ? ` with subtext "${subtitle}"` : ""}, grid layout, museum exhibition aesthetic`,
      },
      {
        id: "poster_noir",
        name: "Gothic Noir Movie Poster",
        desc: "Moody detective mystery with rain reflections and bold neon title",
        promptPattern: (title, subtitle) =>
          `gritty dark neo-noir detective film poster, rain-slicked city alley with deep moody shadows, bold glowing typography title "${title || "MIDNIGHT"}"${subtitle ? ` with tagline "${subtitle}"` : ""}, high-contrast chiaroscuro, cinematic 35mm film`,
      },
    ],
  },
];

const DesignTemplatesModal = ({ isOpen, onClose, onApplyTemplate }) => {
  const [activeCategory, setActiveCategory] = useState("logos");
  const [selectedTemplate, setSelectedTemplate] = useState(designCategories[0].templates[0]);
  const [mainText, setMainText] = useState("VIVID");
  const [subText, setSubText] = useState("STUDIO AI");

  if (!isOpen) return null;

  const currentCategory = designCategories.find((c) => c.id === activeCategory) || designCategories[0];
  const generatedPrompt = selectedTemplate.promptPattern(mainText, subText);

  const handleApply = () => {
    if (onApplyTemplate) {
      onApplyTemplate({
        prompt: generatedPrompt,
        aspectRatio: currentCategory.aspectRatio,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-[#0c0c12] border border-white/[0.08] rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Type size={16} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Graphic Design &amp; Typography Studio</h2>
              <p className="text-xs text-zinc-400">Ideogram 2.0-style curated production templates with accurate text rendering</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-white/[0.04] bg-zinc-950/40 overflow-x-auto scrollbar-none">
          {designCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setActiveCategory(cat.id);
                setSelectedTemplate(cat.templates[0]);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-blue-500 text-white shadow-xs"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {cat.icon}
              <span>{cat.title}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Custom Text Configuration Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-950/70 border border-white/[0.06]">
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Primary Headline / Brand Name</span>
                <span className="text-[10px] text-blue-400">Rendered in Image</span>
              </label>
              <input
                type="text"
                value={mainText}
                onChange={(e) => setMainText(e.target.value)}
                placeholder="e.g. TITAN, CYBERPUNK, COFFEE CO."
                className="w-full px-3 py-2 rounded-lg bg-black border border-white/[0.08] text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Secondary Subtitle / Slogan</span>
                <span className="text-[10px] text-zinc-500">Optional</span>
              </label>
              <input
                type="text"
                value={subText}
                onChange={(e) => setSubText(e.target.value)}
                placeholder="e.g. Future of Space, Est. 2026"
                className="w-full px-3 py-2 rounded-lg bg-black border border-white/[0.08] text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50"
              />
            </div>
          </div>

          {/* Template Cards Grid */}
          <div className="space-y-3">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              Select Design Layout:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentCategory.templates.map((tmpl) => {
                const isSelected = selectedTemplate.id === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-blue-500/10 border-blue-500/50 shadow-md shadow-blue-500/10"
                        : "bg-zinc-950/40 border-white/[0.06] hover:border-white/[0.12] hover:bg-zinc-950/70"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white">{tmpl.name}</h3>
                        {isSelected && <CheckCircle2 size={15} className="text-blue-400" />}
                      </div>
                      <p className="text-xs text-zinc-400 leading-relaxed">{tmpl.desc}</p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] font-mono text-zinc-500">
                      <span>Aspect: {currentCategory.aspectRatio}</span>
                      <span className="text-blue-400 font-sans">Click to select</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Assembled Prompt Preview */}
          <div className="space-y-1.5 p-4 rounded-xl bg-black/60 border border-white/[0.06]">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              Assembled Typography Prompt Preview:
            </span>
            <p className="text-xs text-zinc-300 leading-relaxed italic">
              "{generatedPrompt}"
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-white/[0.06] bg-zinc-950/90 flex items-center justify-between">
          <div className="text-xs font-mono text-zinc-400">
            Auto sets ratio: <span className="text-white font-semibold">{currentCategory.aspectRatio}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleApply}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-medium transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <span>Apply Template to Studio</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DesignTemplatesModal;
