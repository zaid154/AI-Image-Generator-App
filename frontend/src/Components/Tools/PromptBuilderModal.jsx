import React, { useState } from "react";
import { X, Sparkles, Copy, Check, RotateCcw, Plus, CheckCircle2, ArrowRight } from "lucide-react";

const builderCategories = [
  {
    id: "camera",
    title: "Camera & Optics",
    icon: "📸",
    tokens: [
      { id: "85mm", label: "85mm Portrait (f/1.4)", value: "85mm portrait lens, f/1.4 shallow depth of field, creamy bokeh" },
      { id: "24mm", label: "24mm Wide Angle", value: "24mm wide angle lens, expansive perspective, architectural sharpness" },
      { id: "macro", label: "Macro 100mm", value: "extreme macro lens photography, intricate microscopic surface textures" },
      { id: "drone", label: "Drone Aerial", value: "high-altitude aerial drone shot, top-down bird's eye view perspective" },
      { id: "telephoto", label: "300mm Telephoto", value: "300mm telephoto compressed perspective, sharp subject isolation" },
      { id: "vintage35", label: "Vintage 35mm Film", value: "authentic 35mm film grain, Kodachrome analog exposure, subtle light bleed" },
      { id: "fisheye", label: "Fisheye Lens", value: "dynamic curved fisheye perspective, 180-degree spherical distortion" },
      { id: "anamorphic", label: "Anamorphic Cinema", value: "anamorphic widescreen lens, horizontal blue streak lens flares, 2.39:1 aspect ratio" },
    ],
  },
  {
    id: "lighting",
    title: "Lighting Design",
    icon: "💡",
    tokens: [
      { id: "golden_hour", label: "Golden Hour Glow", value: "warm golden hour sunlight, low angle sunbeams, soft radiant rim lighting" },
      { id: "volumetric", label: "Volumetric God Rays", value: "volumetric fog with dramatic sun rays piercing through atmospheric mist" },
      { id: "cyber_neon", label: "Cyberpunk Neon", value: "vibrant neon rim lighting, glowing cyan and magenta reflections on wet pavement" },
      { id: "rembrandt", label: "Rembrandt Studio", value: "classic Rembrandt studio lighting, subtle triangle shadow on cheek, deep contrast" },
      { id: "bioluminescent", label: "Bioluminescent", value: "ethereal bioluminescent glow emanating from flora, dark ambient starlight" },
      { id: "chiaroscuro", label: "Dramatic Chiaroscuro", value: "dramatic chiaroscuro lighting, deep black shadows, stark single-source illumination" },
      { id: "softbox", label: "Studio Softbox", value: "high-end editorial diffuse softbox key light, even skin tones, zero harsh glare" },
      { id: "moonlight", label: "Moonlit Night", value: "cold silver moonlight casting soft shadows, moody midnight atmospheric glow" },
    ],
  },
  {
    id: "medium",
    title: "Art Medium & Engine",
    icon: "🎨",
    tokens: [
      { id: "photo_8k", label: "Photorealistic 8K", value: "photorealistic 8k, Hasselblad medium format camera, ultra-fine micro details" },
      { id: "octane_3d", label: "Octane 3D Render", value: "hyperdetailed Octane 3D digital render, raytraced reflections, subsurface scattering" },
      { id: "unreal5", label: "Unreal Engine 5", value: "Unreal Engine 5 real-time graphics, Nanite geometry, cinematic Lumen lighting" },
      { id: "ghibli_anime", label: "Studio Ghibli Anime", value: "Studio Ghibli aesthetic, hand-painted watercolor skies, lush green vegetation, cel shaded" },
      { id: "oil_impasto", label: "Oil on Canvas", value: "masterpiece classical oil painting, thick impasto palette knife brushwork, canvas texture" },
      { id: "watercolor", label: "Flowing Watercolor", value: "delicate translucent watercolor washes, fluid bleeding pigment edges, rough cotton paper" },
      { id: "claymation", label: "Claymation 3D", value: "tactile stop-motion claymation, sculpted clay fingerprints, soft studio lighting" },
      { id: "polaroid", label: "Polaroid Instant", value: "faded vintage Polaroid instant snapshot, flash falloff, authentic white border, 1980s nostalgia" },
    ],
  },
  {
    id: "mood",
    title: "Mood & Atmosphere",
    icon: "🎭",
    tokens: [
      { id: "ethereal", label: "Ethereal & Dreamy", value: "ethereal dreamy atmosphere, soft hazy glow, peaceful otherworldly sensation" },
      { id: "dark_noir", label: "Dark Noir Gothic", value: "dark gothic noir aesthetic, rain-slicked surfaces, heavy moody shadows, brooding tension" },
      { id: "vibrant", label: "Joyful & Energetic", value: "vibrant cheerful palette, dynamic uplifting energy, crisp clean saturation" },
      { id: "apocalyptic", label: "Apocalyptic Sci-Fi", value: "dystopian apocalyptic wasteland, crumbling futuristic megastructures, dusty red atmosphere" },
      { id: "zen", label: "Minimalist Zen", value: "minimalist Japanese wabi-sabi atmosphere, negative space, serene organic simplicity" },
      { id: "mysterious", label: "Misty Mysterious", value: "dense rolling fog, enigmatic silhouette in mist, quiet haunting ambience" },
    ],
  },
  {
    id: "composition",
    title: "Framing & Composition",
    icon: "📐",
    tokens: [
      { id: "thirds", label: "Rule of Thirds", value: "balanced rule of thirds framing, intentional off-center focal subject" },
      { id: "symmetry", label: "Perfect Symmetry", value: "flawless bilateral symmetry, centered architectural alignment, Wes Anderson framing" },
      { id: "spiral", label: "Golden Spiral", value: "natural Fibonacci golden spiral composition leading the viewer's eye" },
      { id: "dutch", label: "Dutch Tilt Angle", value: "canted Dutch tilt camera angle, diagonal dynamic horizon line" },
      { id: "close_up", label: "Intense Close-Up", value: "tight macro close-up framing focusing on expressive gaze and intricate details" },
      { id: "panoramic", label: "Cinematic 21:9 Wide", value: "sweeping 21:9 panoramic wide angle framing, vast scenic scale" },
    ],
  },
  {
    id: "palette",
    title: "Color Harmonies",
    icon: "🌈",
    tokens: [
      { id: "cyber_palette", label: "Synthwave Neon", value: "color graded in electric cyan, deep magenta, and ultraviolet purple" },
      { id: "earthy", label: "Warm Terracotta", value: "earthy color harmony of warm terracotta, sage green, and raw ochre" },
      { id: "noir_mono", label: "Noir Monochrome", value: "high-contrast black and white monochrome with deep silvery midtones" },
      { id: "pastel", label: "Pastel Dream", value: "soft pastel color palette of lavender, pale mint, and peach blush" },
      { id: "emerald_gold", label: "Emerald & Gold", value: "regal color palette of deep emerald velvet, burnished brass, and rich gold leaf" },
      { id: "arctic", label: "Nordic Ice Blue", value: "frosty arctic color scheme of glacial turquoise, crisp silver, and slate grey" },
    ],
  },
];

const PromptBuilderModal = ({ isOpen, onClose, currentPrompt = "", onApplyPrompt }) => {
  const [baseSubject, setBaseSubject] = useState(currentPrompt || "");
  const [selectedTokens, setSelectedTokens] = useState({});
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const toggleToken = (categoryId, token) => {
    setSelectedTokens((prev) => {
      const copy = { ...prev };
      if (copy[token.id]) {
        delete copy[token.id];
      } else {
        copy[token.id] = token.value;
      }
      return copy;
    });
  };

  const clearTokens = () => {
    setSelectedTokens({});
  };

  const getAssembledPrompt = () => {
    const parts = [];
    if (baseSubject.trim()) {
      parts.push(baseSubject.trim());
    }
    const tokenValues = Object.values(selectedTokens);
    if (tokenValues.length > 0) {
      parts.push(tokenValues.join(", "));
    }
    return parts.join(", ");
  };

  const assembledPrompt = getAssembledPrompt();

  const handleCopy = () => {
    if (!assembledPrompt) return;
    navigator.clipboard.writeText(assembledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApply = () => {
    if (onApplyPrompt && assembledPrompt) {
      onApplyPrompt(assembledPrompt);
    }
    onClose();
  };

  const selectedCount = Object.keys(selectedTokens).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-[#0c0c12] border border-white/[0.08] rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Sparkles size={16} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Visual Prompt Builder Matrix</h2>
              <p className="text-xs text-zinc-400">Click professional cinema, lighting, and style tokens to assemble high-fidelity prompts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body: Scrollable Categories */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-zinc-800">
          
          {/* Base Subject Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
              1. Core Subject / Idea
            </label>
            <input
              type="text"
              value={baseSubject}
              onChange={(e) => setBaseSubject(e.target.value)}
              placeholder="e.g., A cybernetic samurai standing on a rainy neon rooftop..."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/[0.08] text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
            />
          </div>

          {/* Category Chips Matrix */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                2. Style, Optics &amp; Atmosphere Tokens ({selectedCount} active)
              </span>
              {selectedCount > 0 && (
                <button
                  onClick={clearTokens}
                  className="text-xs text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Reset All Tokens</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {builderCategories.map((category) => (
                <div key={category.id} className="p-4 rounded-xl bg-zinc-950/40 border border-white/[0.04] space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-300">
                    <span>{category.icon}</span>
                    <span>{category.title}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {category.tokens.map((token) => {
                      const isSelected = !!selectedTokens[token.id];
                      return (
                        <button
                          key={token.id}
                          type="button"
                          onClick={() => toggleToken(category.id, token)}
                          className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 select-none ${
                            isSelected
                              ? "bg-blue-500/15 border-blue-500/50 text-blue-300 font-medium shadow-sm shadow-blue-500/10"
                              : "bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-zinc-200 hover:border-white/[0.12] hover:bg-white/[0.05]"
                          }`}
                        >
                          {isSelected ? (
                            <CheckCircle2 size={12} className="text-blue-400 shrink-0" />
                          ) : (
                            <Plus size={12} className="text-zinc-600 shrink-0" />
                          )}
                          <span>{token.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer: Live Assembled Prompt Preview & Apply */}
        <div className="p-5 border-t border-white/[0.06] bg-zinc-950/80 space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Live Assembled Prompt Preview:
              </span>
              <button
                onClick={handleCopy}
                disabled={!assembledPrompt}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? "Copied" : "Copy string"}</span>
              </button>
            </div>
            <div className="p-3 rounded-lg bg-black/60 border border-white/[0.06] text-xs text-zinc-300 leading-relaxed max-h-20 overflow-y-auto">
              {assembledPrompt || <span className="text-zinc-600 italic">Select tokens or type a subject above to compose your prompt...</span>}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleApply}
              disabled={!assembledPrompt}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-medium transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              <span>Apply to Studio Prompt</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PromptBuilderModal;
