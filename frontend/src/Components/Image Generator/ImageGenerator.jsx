import React, { useRef, useState, useEffect } from "react";
import { 
  Download, Copy, Check, RefreshCw, X, AlertCircle, Sparkles, 
  Image as ImageIcon, Wand2, Dices, Scissors, Maximize2, Sliders, 
  Heart, Trash2, ChevronDown, ChevronUp, Lock, Unlock, Split, Palette,
  Zap, Compass
} from "lucide-react";
import api from "../../api/client";
import StudioEditorModal from "../Tools/StudioEditorModal";
import BeforeAfterSlider from "../Tools/BeforeAfterSlider";

const samplePrompts = [
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

const stylePresets = [
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

const aspectRatios = [
  { id: "1:1", label: "1:1", name: "Square", platform: "Post" },
  { id: "16:9", label: "16:9", name: "Landscape", platform: "YouTube" },
  { id: "9:16", label: "9:16", name: "Portrait", platform: "Reel/Story" },
  { id: "4:3", label: "4:3", name: "Classic", platform: "Photo" },
  { id: "3:4", label: "3:4", name: "Vertical", platform: "Pin" },
  { id: "21:9", label: "21:9", name: "Cinematic", platform: "Banner" },
  { id: "2:3", label: "2:3", name: "Poster", platform: "Print" },
];

const modelsList = [
  { id: "flux-schnell", name: "FLUX.1 Schnell", badge: "Fastest · 8K", desc: "Supreme prompt adherence & photorealism" },
  { id: "sdxl", name: "Stable Diffusion XL", badge: "Artistic", desc: "Classic SDXL with rich atmospheric textures" },
  { id: "anime", name: "Animagine XL 3.1", badge: "Anime / Ghibli", desc: "Fine-tuned for Japanese animation art" },
];

const STORAGE_VAULT_KEY = "vivid_ai_generation_vault_v2";
const STORAGE_ACTIVE_IMAGE_KEY = "vivid_ai_active_image";
const STORAGE_ACTIVE_PROMPT_KEY = "vivid_ai_active_prompt";

const ImageGenerator = ({ initialPrompt = "", onClearInitialPrompt }) => {
  // Canvas & Output State
  const [image_url, setImage_url] = useState(() => {
    return localStorage.getItem(STORAGE_ACTIVE_IMAGE_KEY) || "/";
  });
  const [beforeImage, setBeforeImage] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [metaInfo, setMetaInfo] = useState(null);

  // Generation Loading State
  const [loading, setLoading] = useState(false);
  const [toolLoading, setToolLoading] = useState(false);
  const [expandingPrompt, setExpandingPrompt] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("");

  // Prompt & Controls State
  const [promptText, setPromptText] = useState(() => {
    return initialPrompt || localStorage.getItem(STORAGE_ACTIVE_PROMPT_KEY) || "";
  });
  const [negativePrompt, setNegativePrompt] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("none");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("1:1");
  const [selectedModel, setSelectedModel] = useState("flux-schnell");

  // Advanced Parameters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [seed, setSeed] = useState("");
  const [lockSeed, setLockSeed] = useState(false);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [inferenceSteps, setInferenceSteps] = useState(4);

  // Modals & Variations State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [variationsList, setVariationsList] = useState(null);
  const [generatingVariations, setGeneratingVariations] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("all"); // all, favorites

  // Clipboard & UI Alerts
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  // Persistent History Vault
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VAULT_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const inputRef = useRef(null);

  // Save history vault changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VAULT_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }, [history]);

  // Sync initialPrompt prop
  useEffect(() => {
    if (initialPrompt) {
      setPromptText(initialPrompt);
      if (inputRef.current) inputRef.current.value = initialPrompt;
      if (onClearInitialPrompt) onClearInitialPrompt();
      setErrorMessage("");
    }
  }, [initialPrompt, onClearInitialPrompt]);

  // Persist current canvas across navigation
  useEffect(() => {
    if (image_url && image_url !== "/") {
      localStorage.setItem(STORAGE_ACTIVE_IMAGE_KEY, image_url);
    }
    if (promptText) {
      localStorage.setItem(STORAGE_ACTIVE_PROMPT_KEY, promptText);
    }
  }, [image_url, promptText]);

  // Keyboard shortcut: Ctrl+Enter to generate
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (!loading && !toolLoading) {
          e.preventDefault();
          generateImage();
        }
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  });

  // CORE GENERATE METHOD
  const generateImage = async (overridePrompt) => {
    const rawInput = (overridePrompt || promptText || inputRef.current?.value || "").trim();

    if (!rawInput) {
      setErrorMessage("Please enter a prompt description before generating.");
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    setErrorMessage("");
    setSuccessNotice("");
    setShowCompare(false);
    setBeforeImage(null);

    const activeStyleObj = stylePresets.find((s) => s.id === selectedStyle);
    const fullPrompt = rawInput + (activeStyleObj?.promptSuffix || "");

    try {
      setLoading(true);
      setLoadingPhase("Analyzing prompt with Qwen 72B...");
      setCurrentPrompt(rawInput);

      const phaseTimer = setTimeout(() => {
        setLoadingPhase(`Rendering ${selectedAspectRatio} canvas with ${modelsList.find(m => m.id === selectedModel)?.name}...`);
      }, 1200);

      const generatedSeed = lockSeed && seed ? seed : Math.floor(Math.random() * 10000000);
      if (!lockSeed) setSeed(String(generatedSeed));

      const data = await api.generateImage({
        prompt: fullPrompt,
        negativePrompt: negativePrompt.trim(),
        aspectRatio: selectedAspectRatio,
        model: selectedModel,
        seed: generatedSeed,
        guidanceScale,
        numInferenceSteps: inferenceSteps,
      });

      clearTimeout(phaseTimer);

      const newImageUrl = `data:image/png;base64,${data.image}`;
      setImage_url(newImageUrl);
      if (data.enhancedPrompt) {
        setEnhancedPrompt(data.enhancedPrompt);
      }

      setMetaInfo({
        model: selectedModel,
        aspectRatio: selectedAspectRatio,
        seed: generatedSeed,
        durationMs: data.durationMs || 1800,
      });

      // Add to persistent vault
      const newEntry = {
        id: Date.now(),
        url: newImageUrl,
        prompt: rawInput,
        enhanced: data.enhancedPrompt,
        aspectRatio: selectedAspectRatio,
        model: selectedModel,
        seed: generatedSeed,
        isFavorite: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setHistory((prev) => [newEntry, ...prev.slice(0, 39)]);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
      setLoadingPhase("");
    }
  };

  // 1-Click AI Magic Expander
  const handleMagicExpand = async () => {
    const raw = promptText.trim();
    if (!raw) {
      setErrorMessage("Enter a basic keyword or idea first to expand!");
      return;
    }
    try {
      setExpandingPrompt(true);
      setErrorMessage("");
      const expanded = await api.expandPrompt(raw);
      setPromptText(expanded);
      if (inputRef.current) inputRef.current.value = expanded;
      setSuccessNotice("✨ Prompt enhanced with creative art direction!");
      setTimeout(() => setSuccessNotice(""), 3500);
    } catch (err) {
      setErrorMessage(err.message || "Failed to expand prompt");
    } finally {
      setExpandingPrompt(false);
    }
  };

  // AI Prompt Variations Generator
  const handleGetVariations = async () => {
    const raw = promptText.trim();
    if (!raw) {
      setErrorMessage("Enter a prompt description to generate variations!");
      return;
    }
    try {
      setGeneratingVariations(true);
      setErrorMessage("");
      const vars = await api.getPromptVariations(raw);
      setVariationsList(vars);
    } catch (err) {
      setErrorMessage(err.message || "Failed to generate variations");
    } finally {
      setGeneratingVariations(false);
    }
  };

  // 1-Click Remove Background with Before/After
  const handleRemoveBackground = async () => {
    if (image_url === "/" || loading || toolLoading) return;
    try {
      setToolLoading(true);
      setLoadingPhase("Extracting subject with RMBG 1.4 AI...");
      setErrorMessage("");

      const original = image_url;
      const data = await api.removeBackground(image_url);

      const newUrl = `data:image/png;base64,${data.image}`;
      setBeforeImage(original);
      setImage_url(newUrl);
      setShowCompare(true);
      setSuccessNotice("Background removed! Use the comparison slider or download transparent PNG.");
      setTimeout(() => setSuccessNotice(""), 4500);
    } catch (err) {
      setErrorMessage(err.message || "Background removal failed.");
    } finally {
      setToolLoading(false);
      setLoadingPhase("");
    }
  };

  // 1-Click AI Upscale with Before/After
  const handleUpscale = async () => {
    if (image_url === "/" || loading || toolLoading) return;
    try {
      setToolLoading(true);
      setLoadingPhase("Reconstructing 4K details with Clarity AI...");
      setErrorMessage("");

      const original = image_url;
      const data = await api.upscaleImage(image_url);

      const newUrl = `data:image/png;base64,${data.image}`;
      setBeforeImage(original);
      setImage_url(newUrl);
      setShowCompare(true);
      setSuccessNotice("Image enhanced with Super-Resolution AI!");
      setTimeout(() => setSuccessNotice(""), 4500);
    } catch (err) {
      setErrorMessage(err.message || "Image upscaling failed.");
    } finally {
      setToolLoading(false);
      setLoadingPhase("");
    }
  };

  // Toggle Favorite in History
  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  // Delete Single History Item
  const deleteHistoryItem = (id, e) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // Download Handler (supports PNG, WebP, JPG)
  const handleDownload = (format = "png") => {
    if (image_url === "/") return;
    
    // If original format is PNG, we can download directly
    if (format === "png") {
      const link = document.createElement("a");
      link.href = image_url;
      link.download = `vivid-ai-${selectedAspectRatio.replace(":", "-")}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // Convert via canvas for WebP/JPG
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = image_url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const mime = format === "webp" ? "image/webp" : "image/jpeg";
      const convertedUrl = canvas.toDataURL(mime, 0.95);
      const link = document.createElement("a");
      link.href = convertedUrl;
      link.download = `vivid-ai-${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
  };

  const handleCopyPrompt = () => {
    const textToCopy = enhancedPrompt || currentPrompt;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyImageToClipboard = async () => {
    if (image_url === "/") return;
    try {
      const res = await fetch(image_url);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch (err) {
      console.warn("Direct image clipboard unsupported, fallback copy prompt", err);
      handleCopyPrompt();
    }
  };

  const handleRandomPrompt = () => {
    const random = samplePrompts[Math.floor(Math.random() * samplePrompts.length)];
    setPromptText(random);
    if (inputRef.current) {
      inputRef.current.value = random;
      inputRef.current.focus();
    }
    setErrorMessage("");
  };

  const isBusy = loading || toolLoading || expandingPrompt || generatingVariations;
  const filteredHistory = historyFilter === "favorites" ? history.filter((h) => h.isFavorite) : history;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-56px)] flex items-center justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: Controls Studio Panel (5 Cols)             */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 flex flex-col gap-4 lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto pr-2 scrollbar-none w-full">
          
          {/* Notification Alerts */}
          {errorMessage && (
            <div role="alert" className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-start justify-between gap-3 animate-in fade-in duration-150">
              <div className="flex items-start gap-2">
                <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
              <button onClick={() => setErrorMessage("")} className="text-red-400 hover:text-white cursor-pointer">
                <X size={14} />
              </button>
            </div>
          )}

          {successNotice && (
            <div role="status" className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-start justify-between gap-3 animate-in fade-in duration-150">
              <div className="flex items-start gap-2">
                <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{successNotice}</span>
              </div>
              <button onClick={() => setSuccessNotice("")} className="text-emerald-400 hover:text-white cursor-pointer">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Model Switcher Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium flex items-center gap-1.5">
                <Zap size={13} className="text-blue-400" />
                <span>AI Generation Engine</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-mono">100% Free Inference</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-950/70 rounded-lg border border-white/[0.06]">
              {modelsList.map((m) => {
                const isSelected = selectedModel === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedModel(m.id)}
                    disabled={isBusy}
                    className={`py-1.5 px-2 rounded text-left transition-colors cursor-pointer flex flex-col ${
                      isSelected ? "bg-white/[0.1] text-white shadow-xs" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-medium truncate">{m.name.split(" ")[0]}</span>
                    <span className="text-[9px] text-zinc-500 truncate">{m.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt Input Section with AI Co-Pilot Controls */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="prompt-input" className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                Prompt Description
              </label>
              
              <div className="flex items-center gap-2">
                {/* AI Magic Expander */}
                <button
                  type="button"
                  onClick={handleMagicExpand}
                  disabled={isBusy}
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Expand simple prompt into detailed art direction"
                >
                  <Sparkles size={12} />
                  <span>{expandingPrompt ? "Expanding..." : "AI Expand"}</span>
                </button>

                {/* Variations Generator */}
                <button
                  type="button"
                  onClick={handleGetVariations}
                  disabled={isBusy}
                  className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Generate 3 creative perspectives for this prompt"
                >
                  <Wand2 size={12} />
                  <span>Variations</span>
                </button>

                {/* Surprise Me */}
                <button
                  type="button"
                  onClick={handleRandomPrompt}
                  disabled={isBusy}
                  className="text-[11px] text-zinc-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  title="Randomize trending prompt"
                >
                  <Dices size={13} />
                </button>

                {promptText.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPromptText("")}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <span className="text-[11px] text-zinc-500 font-mono">{promptText.length}/400</span>
              </div>
            </div>

            <div className="relative">
              <textarea
                id="prompt-input"
                ref={inputRef}
                rows={3}
                maxLength={400}
                value={promptText}
                onChange={(e) => {
                  setPromptText(e.target.value);
                  if (errorMessage) setErrorMessage("");
                }}
                disabled={isBusy}
                placeholder="Describe your scene in detail... (Press Ctrl+Enter to generate)"
                className="w-full bg-zinc-950/70 border border-white/[0.08] focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 rounded-lg p-3 text-sm text-white placeholder-zinc-500 resize-none disabled:opacity-50 transition-colors focus-visible:outline-none"
              />
            </div>
          </div>

          {/* AI Variations Dropdown (When triggered) */}
          {variationsList && (
            <div className="p-3 rounded-lg bg-zinc-900/40 border border-purple-500/30 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs text-purple-300 font-medium">
                <span className="flex items-center gap-1">
                  <Wand2 size={13} />
                  <span>Pick an Artistic Variation</span>
                </span>
                <button onClick={() => setVariationsList(null)} className="text-zinc-500 hover:text-white cursor-pointer">
                  <X size={13} />
                </button>
              </div>
              <div className="space-y-1.5">
                {variationsList.map((v, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setPromptText(v.prompt);
                      if (inputRef.current) inputRef.current.value = v.prompt;
                      setVariationsList(null);
                    }}
                    className="w-full text-left p-2 rounded bg-zinc-950 hover:bg-white/[0.05] border border-white/[0.05] transition-colors cursor-pointer"
                  >
                    <span className="text-[11px] font-semibold text-white block">{v.title}</span>
                    <span className="text-[10px] text-zinc-400 leading-tight line-clamp-2">{v.prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Platform Aspect Ratio Selector */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                Aspect Ratio
              </label>
              <span className="text-[11px] text-zinc-400 font-mono">
                {aspectRatios.find(r => r.id === selectedAspectRatio)?.name} ({aspectRatios.find(r => r.id === selectedAspectRatio)?.platform})
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1 p-1 rounded-lg bg-zinc-950/70 border border-white/[0.06]">
              {aspectRatios.map((ratio) => {
                const isActive = selectedAspectRatio === ratio.id;
                return (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setSelectedAspectRatio(ratio.id)}
                    disabled={isBusy}
                    className={`py-1.5 px-1 text-xs rounded transition-colors cursor-pointer flex flex-col items-center justify-center ${
                      isActive
                        ? "bg-white/[0.1] text-white font-semibold shadow-xs"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="font-mono text-xs">{ratio.label}</span>
                    <span className="text-[8px] text-zinc-500 truncate w-full text-center">{ratio.platform}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Style Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-zinc-400 uppercase tracking-wider font-medium flex items-center gap-1.5">
              <Palette size={13} className="text-blue-400" />
              <span>Aesthetic Style Preset</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 rounded-lg bg-zinc-950/70 border border-white/[0.06]">
              {stylePresets.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id)}
                  disabled={isBusy}
                  className={`px-2 py-1.5 text-xs rounded transition-colors cursor-pointer text-center truncate ${
                    selectedStyle === style.id
                      ? "bg-white/[0.1] text-white font-medium shadow-xs"
                      : "text-zinc-400 hover:text-white"
                  }`}
                  title={style.name}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* Collapsible Advanced Settings (Seed, Negative Prompt, CFG) */}
          <div className="border border-white/[0.06] rounded-lg bg-zinc-950/40 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced((prev) => !prev)}
              className="w-full px-3 py-2 text-xs font-medium text-zinc-400 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Sliders size={13} />
                <span>Advanced Controls (Negative Prompt &amp; Seed)</span>
              </div>
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showAdvanced && (
              <div className="p-3 border-t border-white/[0.06] space-y-3">
                {/* Negative Prompt */}
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400 font-medium">Negative Prompt (Exclude)</label>
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="blurry, distorted anatomy, bad hands, low resolution, watermark"
                    className="w-full p-2 text-xs bg-zinc-950 border border-white/[0.08] rounded text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Seed Control */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] text-zinc-400 font-medium">Reproducibility Seed</label>
                    <input
                      type="text"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      placeholder="Random seed"
                      className="w-full p-2 text-xs bg-zinc-950 border border-white/[0.08] rounded text-white placeholder-zinc-600 font-mono focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setLockSeed((prev) => !prev)}
                    className={`mt-4 p-2 rounded border text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                      lockSeed ? "bg-amber-500/20 border-amber-500 text-amber-300" : "bg-zinc-950 border-white/[0.08] text-zinc-400"
                    }`}
                    title={lockSeed ? "Seed is locked" : "Lock seed to reproduce same image"}
                  >
                    {lockSeed ? <Lock size={13} /> : <Unlock size={13} />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Primary Action Generate Button */}
          <button
            type="button"
            onClick={() => generateImage()}
            disabled={isBusy || !promptText.trim()}
            aria-busy={isBusy}
            className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-medium py-3 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-md"
          >
            {isBusy ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>{loadingPhase || "Processing with AI Engine..."}</span>
              </>
            ) : (
              <span>Generate Masterpiece (Ctrl+Enter)</span>
            )}
          </button>

          {/* Curated Sample Prompts */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-white/[0.06]">
            <span className="text-[11px] text-zinc-400 font-medium flex items-center gap-1">
              <Compass size={12} />
              <span>Inspiration Prompts</span>
            </span>
            <div className="flex flex-col gap-1">
              {samplePrompts.slice(0, 3).map((prompt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setPromptText(prompt);
                    if (inputRef.current) inputRef.current.value = prompt;
                    generateImage(prompt);
                  }}
                  disabled={isBusy}
                  className="text-left text-xs text-zinc-400 hover:text-blue-400 cursor-pointer transition-colors p-1.5 rounded hover:bg-white/[0.02] truncate"
                  title={prompt}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Persistent Vault / History */}
          {history.length > 0 && (
            <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-medium">Session Vault</span>
                  <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded border border-white/[0.06] text-[10px]">
                    <button
                      type="button"
                      onClick={() => setHistoryFilter("all")}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${historyFilter === "all" ? "bg-white/[0.1] text-white" : "text-zinc-500"}`}
                    >
                      All ({history.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setHistoryFilter("favorites")}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${historyFilter === "favorites" ? "bg-white/[0.1] text-white" : "text-zinc-500"}`}
                    >
                      ❤️ Favs ({history.filter(h => h.isFavorite).length})
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className="text-[10px] text-zinc-500 hover:text-red-400 cursor-pointer"
                  title="Clear history"
                >
                  Clear All
                </button>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="relative group shrink-0"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setImage_url(item.url);
                        setCurrentPrompt(item.prompt);
                        setPromptText(item.prompt);
                        setEnhancedPrompt(item.enhanced || "");
                        if (item.aspectRatio) setSelectedAspectRatio(item.aspectRatio);
                        if (item.model) setSelectedModel(item.model);
                        if (item.seed) setSeed(String(item.seed));
                        setShowCompare(false);
                      }}
                      title={`${item.prompt} (${item.timestamp})`}
                      className={`w-12 h-12 rounded-lg overflow-hidden block transition-all cursor-pointer border ${
                        image_url === item.url
                          ? "border-blue-500 ring-2 ring-blue-500/40 scale-105"
                          : "border-white/[0.08] opacity-75 hover:opacity-100"
                      }`}
                    >
                      <img src={item.url} alt="History thumb" className="w-full h-full object-cover" />
                    </button>

                    {/* Quick Heart Favorite Badge */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(item.id, e)}
                      className={`absolute top-0.5 right-0.5 p-0.5 rounded-full backdrop-blur-md cursor-pointer transition-opacity ${
                        item.isFavorite ? "text-red-400 opacity-100" : "text-zinc-400 opacity-0 group-hover:opacity-100 bg-black/60"
                      }`}
                    >
                      <Heart size={10} fill={item.isFavorite ? "currentColor" : "none"} />
                    </button>

                    {/* Delete Item */}
                    <button
                      type="button"
                      onClick={(e) => deleteHistoryItem(item.id, e)}
                      className="absolute bottom-0.5 right-0.5 p-0.5 rounded-full bg-black/60 text-zinc-400 hover:text-red-400 opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: Dedicated Studio Canvas + Ecosystem (7 Cols)*/}
        {/* ======================================================== */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center h-full w-full">
          
          {/* Dynamic Canvas Container matching Aspect Ratio */}
          <div className={`relative rounded-xl overflow-hidden bg-zinc-950 border border-white/[0.08] flex items-center justify-center transition-all duration-300 shadow-2xl ${
            selectedAspectRatio === "16:9"
              ? "w-full max-w-[640px] aspect-video"
              : selectedAspectRatio === "9:16"
              ? "h-[min(510px,calc(100vh-100px))] aspect-[9/16]"
              : selectedAspectRatio === "4:3"
              ? "w-full max-w-[560px] aspect-[4/3]"
              : selectedAspectRatio === "3:4"
              ? "h-[min(510px,calc(100vh-100px))] aspect-[3/4]"
              : selectedAspectRatio === "21:9"
              ? "w-full max-w-[680px] aspect-[21/9]"
              : selectedAspectRatio === "2:3"
              ? "h-[min(510px,calc(100vh-100px))] aspect-[2/3]"
              : "h-[min(510px,calc(100vh-100px))] w-[min(510px,calc(100vh-100px))] aspect-square"
          }`}>
            
            {/* When image has been generated */}
            {image_url !== "/" ? (
              showCompare && beforeImage ? (
                /* Interactive Before / After Comparison Slider */
                <BeforeAfterSlider
                  beforeImage={beforeImage}
                  afterImage={image_url}
                  beforeLabel="Before"
                  afterLabel="Processed"
                />
              ) : (
                /* Standard Image Canvas */
                <img
                  src={image_url}
                  alt={currentPrompt || "AI Artwork"}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    isBusy ? "opacity-25" : "opacity-100"
                  }`}
                />
              )
            ) : (
              /* Intentional Empty State */
              <div className="p-8 text-center flex flex-col items-center justify-center max-w-sm">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-4 text-zinc-500 shadow-inner">
                  <ImageIcon size={26} />
                </div>
                <h2 className="text-base font-semibold text-white tracking-tight">Visual Studio Canvas</h2>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Enter a prompt or click "AI Expand" to start synthesizing with FLUX.1.
                </p>
                <div className="mt-5 flex items-center gap-2 text-[11px] font-mono text-zinc-400 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <span>{selectedAspectRatio}</span>
                  <span>·</span>
                  <span>{modelsList.find(m => m.id === selectedModel)?.name}</span>
                </div>
              </div>
            )}

            {/* Loading Overlay with Real-Time Phase Spinner */}
            {isBusy && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/75 backdrop-blur-xs p-6 text-center z-20">
                <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-white">{loadingPhase || "Processing..."}</p>
                  <p className="text-[11px] text-zinc-400 max-w-[280px] truncate">
                    "{promptText}"
                  </p>
                </div>
              </div>
            )}

            {/* Inference Badge at Top-Left */}
            {metaInfo && !isBusy && image_url !== "/" && (
              <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/[0.08] text-[10px] font-mono text-zinc-300 z-10 pointer-events-none">
                <span>⚡ {(metaInfo.durationMs / 1000).toFixed(1)}s</span>
                <span>·</span>
                <span>Seed: {metaInfo.seed}</span>
              </div>
            )}

            {/* Comprehensive Action Hub Bar on Bottom-Right */}
            {!isBusy && image_url !== "/" && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/85 backdrop-blur-md p-1.5 rounded-xl border border-white/[0.1] shadow-xl z-10">
                
                {/* 1-Click Studio Photo Editor */}
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(true)}
                  title="Open Canvas Studio Editor (Color grading, transforms, text)"
                  className="text-zinc-300 hover:text-white hover:bg-white/[0.08] px-2 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  <Sliders size={13} className="text-blue-400" />
                  <span className="hidden sm:inline">Editor</span>
                </button>

                {/* 1-Click Background Remover */}
                <button
                  type="button"
                  onClick={handleRemoveBackground}
                  title="Erase background with RMBG 1.4 AI"
                  className="text-zinc-300 hover:text-white hover:bg-white/[0.08] px-2 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  <Scissors size={13} className="text-purple-400" />
                  <span className="hidden sm:inline">Remove BG</span>
                </button>

                {/* 1-Click AI Upscale */}
                <button
                  type="button"
                  onClick={handleUpscale}
                  title="Super-Resolution 4K Upscale"
                  className="text-zinc-300 hover:text-white hover:bg-white/[0.08] px-2 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  <Maximize2 size={13} className="text-emerald-400" />
                  <span className="hidden sm:inline">Upscale</span>
                </button>

                {/* Compare Split Toggle (if before image exists) */}
                {beforeImage && (
                  <button
                    type="button"
                    onClick={() => setShowCompare((prev) => !prev)}
                    title="Toggle Before/After Split Comparison"
                    className={`px-2 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs ${
                      showCompare ? "bg-blue-500/20 text-blue-300 border border-blue-500/40" : "text-zinc-300 hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    <Split size={13} />
                    <span className="hidden sm:inline">Compare</span>
                  </button>
                )}

                <div className="w-px h-3.5 bg-white/[0.1] mx-0.5" />

                {/* Copy Image */}
                <button
                  type="button"
                  onClick={handleCopyImageToClipboard}
                  title="Copy image to clipboard"
                  className="text-zinc-300 hover:text-white hover:bg-white/[0.08] px-2 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  {copiedImage ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span className="hidden sm:inline">{copiedImage ? "Copied" : "Copy"}</span>
                </button>

                {/* Download Lossless PNG */}
                <button
                  type="button"
                  onClick={() => handleDownload("png")}
                  title="Download full quality PNG"
                  className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium shadow-sm"
                >
                  <Download size={13} />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Caption underneath Canvas */}
          {currentPrompt && !isBusy && (
            <div className="mt-3 text-xs text-zinc-400 italic truncate max-w-md w-full text-center px-4 flex items-center justify-center gap-2">
              <span className="truncate">"{currentPrompt}"</span>
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="text-zinc-500 hover:text-white transition-colors shrink-0 cursor-pointer"
                title="Copy prompt text"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Full-Screen In-Browser Studio Creative Editor Modal */}
      <StudioEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        imageUrl={image_url}
        onApplyToCanvas={(editedDataUrl) => {
          setImage_url(editedDataUrl);
          setSuccessNotice("Adjustments applied to visual canvas!");
          setTimeout(() => setSuccessNotice(""), 3500);
        }}
      />
    </div>
  );
};

export default ImageGenerator;