import React, { useRef, useState, useEffect } from "react";
import { 
  Download, Copy, Check, X, AlertCircle, Sparkles, 
  Image as ImageIcon, Wand2, Dices, Scissors, Maximize2, Sliders, 
  Heart, Trash2, ChevronDown, ChevronUp, Lock, Unlock, Split, Palette,
  Zap, Compass, Paintbrush, Share2, Folder, FolderPlus, Layers, Upload, Eye,
  FileCode, Type, GitFork
} from "lucide-react";
import api from "../api/client";
import StudioEditorModal from "./Tools/StudioEditorModal";
import BeforeAfterSlider from "./Tools/BeforeAfterSlider";
import PromptBuilderModal from "./Tools/PromptBuilderModal";
import InpaintingCanvasModal from "./Tools/InpaintingCanvasModal";
import SocialShareCardModal from "./Tools/SocialShareCardModal";
import VectorConverterModal from "./Tools/VectorConverterModal";
import DesignTemplatesModal from "./Tools/DesignTemplatesModal";
import MetadataInspectorModal from "./Tools/MetadataInspectorModal";
import { extractDominantColors } from "../utils/colorExtractor";
import {
  samplePrompts,
  stylePresets,
  aspectRatios,
  modelsList,
  STORAGE_VAULT_KEY,
  STORAGE_ACTIVE_IMAGE_KEY,
  STORAGE_ACTIVE_PROMPT_KEY,
  STORAGE_COLLECTIONS_KEY
} from "../constants/generator";

const ImageGenerator = ({ initialPrompt = "", onClearInitialPrompt }) => {
  const [image_url, setImage_url] = useState(() => localStorage.getItem(STORAGE_ACTIVE_IMAGE_KEY) || "/");
  const [beforeImage, setBeforeImage] = useState(null);
  const [showCompare, setShowCompare] = useState(false);
  const [metaInfo, setMetaInfo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [toolLoading, setToolLoading] = useState(false);
  const [expandingPrompt, setExpandingPrompt] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("");

  const [promptText, setPromptText] = useState(() => initialPrompt || localStorage.getItem(STORAGE_ACTIVE_PROMPT_KEY) || "");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("none");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("1:1");
  const [selectedModel, setSelectedModel] = useState("flux-schnell");

  const [gridMode, setGridMode] = useState(1);
  const [batchImages, setBatchImages] = useState([]);

  const [showImg2Img, setShowImg2Img] = useState(false);
  const [referenceImage, setReferenceImage] = useState(null);
  const [referenceStrength, setReferenceStrength] = useState(0.5);
  const refFileInputRef = useRef(null);

  const [dominantColors, setDominantColors] = useState([]);
  const [copiedHex, setCopiedHex] = useState(null);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [seed, setSeed] = useState("");
  const [lockSeed, setLockSeed] = useState(false);
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [inferenceSteps, setInferenceSteps] = useState(4);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPromptBuilderOpen, setIsPromptBuilderOpen] = useState(false);
  const [isInpaintOpen, setIsInpaintOpen] = useState(false);
  const [isShareCardOpen, setIsShareCardOpen] = useState(false);
  const [isVectorModalOpen, setIsVectorModalOpen] = useState(false);
  const [isDesignTemplatesOpen, setIsDesignTemplatesOpen] = useState(false);
  const [inspectedItem, setInspectedItem] = useState(null);
  const [variationsList, setVariationsList] = useState(null);
  const [generatingVariations, setGeneratingVariations] = useState(false);

  const [collections, setCollections] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_COLLECTIONS_KEY);
      return saved ? JSON.parse(saved) : ["Wallpapers", "Characters", "Mockups"];
    } catch {
      return ["Wallpapers", "Characters", "Mockups"];
    }
  });
  const [activeCollectionFilter, setActiveCollectionFilter] = useState("all");
  const [showAddCollection, setShowAddCollection] = useState(false);
  const [newCollectionInput, setNewCollectionInput] = useState("");

  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_VAULT_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  const inputRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VAULT_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COLLECTIONS_KEY, JSON.stringify(collections));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }, [collections]);

  useEffect(() => {
    if (image_url && image_url !== "/") {
      extractDominantColors(image_url).then((colors) => setDominantColors(colors));
    } else {
      setDominantColors([]);
    }
  }, [image_url]);

  useEffect(() => {
    if (initialPrompt) {
      setPromptText(initialPrompt);
      if (inputRef.current) inputRef.current.value = initialPrompt;
      if (onClearInitialPrompt) onClearInitialPrompt();
      setErrorMessage("");
    }
  }, [initialPrompt, onClearInitialPrompt]);

  useEffect(() => {
    if (image_url && image_url !== "/") {
      localStorage.setItem(STORAGE_ACTIVE_IMAGE_KEY, image_url);
    }
    if (promptText) {
      localStorage.setItem(STORAGE_ACTIVE_PROMPT_KEY, promptText);
    }
  }, [image_url, promptText]);

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

  const handleRefImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file for reference.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setReferenceImage(event.target.result);
      setSuccessNotice("Reference image loaded for style guidance.");
      setTimeout(() => setSuccessNotice(""), 3000);
    };
    reader.readAsDataURL(file);
  };

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
      setLoadingPhase(
        gridMode > 1
          ? `Synthesizing ${gridMode}x variations with ${modelsList.find(m => m.id === selectedModel)?.name}...`
          : "Optimizing prompt..."
      );
      setCurrentPrompt(rawInput);

      const phaseTimer = setTimeout(() => {
        setLoadingPhase(`Rendering ${selectedAspectRatio} canvas...`);
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
        batchCount: gridMode,
        referenceImage: referenceImage || undefined,
        referenceStrength,
      });

      clearTimeout(phaseTimer);

      const imagesArray = data.images && data.images.length > 0
        ? data.images.map((img) => (img.startsWith("data:") ? img : `data:image/png;base64,${img}`))
        : [`data:image/png;base64,${data.image}`];

      setBatchImages(imagesArray);
      const primaryUrl = imagesArray[0];
      setImage_url(primaryUrl);

      if (data.enhancedPrompt) {
        setEnhancedPrompt(data.enhancedPrompt);
      }

      setMetaInfo({
        model: selectedModel,
        aspectRatio: selectedAspectRatio,
        seed: generatedSeed,
        durationMs: data.durationMs || 1800,
      });

      const newEntries = imagesArray.map((url, idx) => ({
        id: Date.now() + idx,
        url,
        prompt: rawInput,
        enhanced: data.enhancedPrompt,
        aspectRatio: selectedAspectRatio,
        model: selectedModel,
        seed: Number(generatedSeed) + idx * 1337,
        isFavorite: false,
        collection: "All",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }));

      setHistory((prev) => [...newEntries, ...prev.slice(0, 45)]);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
      setLoadingPhase("");
    }
  };

  const handleMagicExpand = async () => {
    const raw = promptText.trim();
    if (!raw) {
      setErrorMessage("Enter a keyword or idea first to expand.");
      return;
    }
    try {
      setExpandingPrompt(true);
      setErrorMessage("");
      const expanded = await api.expandPrompt(raw);
      setPromptText(expanded);
      if (inputRef.current) inputRef.current.value = expanded;
      setSuccessNotice("Prompt enhanced with creative art direction.");
      setTimeout(() => setSuccessNotice(""), 3500);
    } catch (err) {
      setErrorMessage(err.message || "Failed to expand prompt");
    } finally {
      setExpandingPrompt(false);
    }
  };

  const handleGetVariations = async () => {
    const raw = promptText.trim();
    if (!raw) {
      setErrorMessage("Enter a prompt description to generate variations.");
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

  const handleRemoveBackground = async () => {
    if (image_url === "/" || loading || toolLoading) return;
    try {
      setToolLoading(true);
      setLoadingPhase("Removing background...");
      setErrorMessage("");

      const original = image_url;
      const data = await api.removeBackground(image_url);

      const newUrl = `data:image/png;base64,${data.image}`;
      setBeforeImage(original);
      setImage_url(newUrl);
      setShowCompare(true);
      setSuccessNotice("Background removed. Use comparison slider to review.");
      setTimeout(() => setSuccessNotice(""), 4500);
    } catch (err) {
      setErrorMessage(err.message || "Background removal failed.");
    } finally {
      setToolLoading(false);
      setLoadingPhase("");
    }
  };

  const handleUpscale = async () => {
    if (image_url === "/" || loading || toolLoading) return;
    try {
      setToolLoading(true);
      setLoadingPhase("Upscaling image details...");
      setErrorMessage("");

      const original = image_url;
      const data = await api.upscaleImage(image_url);

      const newUrl = `data:image/png;base64,${data.image}`;
      setBeforeImage(original);
      setImage_url(newUrl);
      setShowCompare(true);
      setSuccessNotice("Image enhanced with AI upscaler.");
      setTimeout(() => setSuccessNotice(""), 4500);
    } catch (err) {
      setErrorMessage(err.message || "Image upscaling failed.");
    } finally {
      setToolLoading(false);
      setLoadingPhase("");
    }
  };

  const handleInjectColorsIntoPrompt = () => {
    if (dominantColors.length === 0) return;
    const hexTokens = dominantColors.map(c => c.hex).join(", ");
    const colorInstruction = `, harmonized color palette featuring ${hexTokens}`;
    setPromptText((prev) => prev.trim() + colorInstruction);
    if (inputRef.current) inputRef.current.value = promptText + colorInstruction;
    setSuccessNotice("Color palette harmonized into your prompt description.");
    setTimeout(() => setSuccessNotice(""), 3500);
  };

  const handleCopyHex = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
  };

  const deleteHistoryItem = (id, e) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const assignItemToCollection = (itemId, collectionName, e) => {
    e.stopPropagation();
    setHistory((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, collection: collectionName } : item))
    );
    setSuccessNotice(`Saved to ${collectionName}.`);
    setTimeout(() => setSuccessNotice(""), 2500);
  };

  const handleCreateCollection = () => {
    const trimmed = newCollectionInput.trim();
    if (!trimmed || collections.includes(trimmed)) return;
    setCollections((prev) => [...prev, trimmed]);
    setNewCollectionInput("");
    setShowAddCollection(false);
    setActiveCollectionFilter(trimmed);
  };

  const handleDownload = (format = "png") => {
    if (image_url === "/") return;
    if (format === "png") {
      const link = document.createElement("a");
      link.href = image_url;
      link.download = `vivid-ai-${selectedAspectRatio.replace(":", "-")}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

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
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch {
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

  const filteredHistory = history.filter((item) => {
    if (activeCollectionFilter === "favorites") return item.isFavorite;
    if (activeCollectionFilter === "all") return true;
    return item.collection === activeCollectionFilter;
  });

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-56px)] flex items-center justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
        
        {/* Controls Column */}
        <div className="lg:col-span-5 flex flex-col gap-4 lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto pr-2 scrollbar-none w-full">
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

          {/* Model Switcher */}
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

          {/* Prompt Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="prompt-input" className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                Prompt Description
              </label>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPromptBuilderOpen(true)}
                  disabled={isBusy}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Open Visual Prompt Builder"
                >
                  <Sparkles size={12} />
                  <span>Prompt Builder</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDesignTemplatesOpen(true)}
                  disabled={isBusy}
                  className="text-[11px] text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Open Typography Templates"
                >
                  <Type size={12} />
                  <span>Typography</span>
                </button>

                <button
                  type="button"
                  onClick={handleMagicExpand}
                  disabled={isBusy}
                  className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Expand simple prompt"
                >
                  <Sparkles size={12} />
                  <span>{expandingPrompt ? "Expanding..." : "AI Expand"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleGetVariations}
                  disabled={isBusy}
                  className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title="Generate 3 perspectives"
                >
                  <Wand2 size={12} />
                  <span>Variations</span>
                </button>

                <button
                  type="button"
                  onClick={handleRandomPrompt}
                  disabled={isBusy}
                  className="text-[11px] text-zinc-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                  title="Random prompt"
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
                placeholder="Describe your scene in detail... (Ctrl+Enter to generate)"
                className="w-full bg-zinc-950/70 border border-white/[0.08] focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 rounded-lg p-3 text-sm text-white placeholder-zinc-500 resize-none disabled:opacity-50 transition-colors focus-visible:outline-none"
              />
            </div>
          </div>

          {/* Variations Dropdown */}
          {variationsList && (
            <div className="p-3 rounded-lg bg-zinc-900/40 border border-purple-500/30 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs text-purple-300 font-medium">
                <span className="flex items-center gap-1">
                  <Wand2 size={13} />
                  <span>Artistic Variations</span>
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
                    <span className="text-[11px] font-semibold text-white block">{v.style || v.title}</span>
                    <span className="text-[10px] text-zinc-400 leading-tight line-clamp-2">{v.prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grid Batch & img2img Bar */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium flex items-center gap-1">
                <Layers size={12} className="text-blue-400" />
                <span>Multi-Grid Batch</span>
              </label>
              <div className="flex rounded-lg bg-zinc-950/70 border border-white/[0.06] p-0.5">
                {[1, 2, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setGridMode(num)}
                    disabled={isBusy}
                    className={`flex-1 py-1 text-xs rounded transition-colors cursor-pointer text-center font-mono ${
                      gridMode === num ? "bg-white/[0.1] text-white font-semibold" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {num}x {num === 1 ? "Single" : num === 2 ? "Split" : "Grid"}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Upload size={12} className="text-purple-400" />
                  <span>Image-to-Image</span>
                </span>
                {referenceImage && (
                  <button
                    type="button"
                    onClick={() => setReferenceImage(null)}
                    className="text-[10px] text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </label>
              <button
                type="button"
                onClick={() => setShowImg2Img(!showImg2Img)}
                className={`w-full py-1.5 px-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors cursor-pointer ${
                  referenceImage
                    ? "bg-purple-950/30 border-purple-500/40 text-purple-300"
                    : showImg2Img
                    ? "bg-white/[0.08] border-white/[0.12] text-white"
                    : "bg-zinc-950/70 border-white/[0.06] text-zinc-400 hover:text-white"
                }`}
              >
                <span className="truncate">{referenceImage ? "Reference Active" : "Add Reference..."}</span>
                {showImg2Img ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>
          </div>

          {/* Reference Image Drawer */}
          {showImg2Img && (
            <div className="p-3 rounded-lg bg-zinc-950/80 border border-purple-500/30 space-y-3 animate-in fade-in duration-150">
              <input
                type="file"
                ref={refFileInputRef}
                onChange={handleRefImageChange}
                accept="image/*"
                className="hidden"
              />
              <div className="flex items-center gap-3">
                {referenceImage ? (
                  <div className="w-14 h-14 rounded-lg overflow-hidden border border-purple-500/40 shrink-0">
                    <img src={referenceImage} alt="Ref preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => refFileInputRef.current?.click()}
                    className="w-14 h-14 rounded-lg border-2 border-dashed border-white/[0.1] hover:border-purple-500/50 flex flex-col items-center justify-center text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer shrink-0"
                  >
                    <Upload size={16} />
                  </button>
                )}

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Influence Strength:</span>
                    <span className="text-purple-400 font-mono">{Math.round(referenceStrength * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={referenceStrength}
                    onChange={(e) => setReferenceStrength(Number(e.target.value))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                  <p className="text-[10px] text-zinc-500">Guides AI composition based on input photo</p>
                </div>
              </div>
            </div>
          )}

          {/* Aspect Ratio Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {aspectRatios.map((ratio) => {
                const isSelected = selectedAspectRatio === ratio.id;
                return (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setSelectedAspectRatio(ratio.id)}
                    disabled={isBusy}
                    className={`py-2 px-1 rounded-lg border text-center transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                      isSelected
                        ? "bg-white/[0.1] border-white/20 text-white font-medium shadow-xs"
                        : "bg-transparent border-white/[0.06] text-zinc-400 hover:border-white/[0.12] hover:text-white"
                    }`}
                  >
                    <span className="text-xs font-mono">{ratio.label}</span>
                    <span className="text-[9px] text-zinc-400 scale-90">{ratio.platform}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Style Presets */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                Artistic Style
              </label>
              <span className="text-[11px] text-zinc-400">
                {stylePresets.find((s) => s.id === selectedStyle)?.name}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {stylePresets.map((style) => {
                const isSelected = selectedStyle === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.id)}
                    disabled={isBusy}
                    className={`px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-white/[0.1] text-white font-medium border border-white/20"
                        : "bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-transparent"
                    }`}
                  >
                    {style.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced Settings Collapsible */}
          <div className="border border-white/[0.06] rounded-lg overflow-hidden bg-zinc-950/40">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full p-3 flex items-center justify-between text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Sliders size={13} />
                <span className="font-medium">Advanced Controls (Seed, Steps, Negative)</span>
              </span>
              {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showAdvanced && (
              <div className="p-3 pt-0 border-t border-white/[0.04] space-y-3 mt-1 animate-in fade-in duration-150">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                    Negative Prompt (Elements to Exclude)
                  </label>
                  <input
                    type="text"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    disabled={isBusy}
                    placeholder="e.g. blur, extra limbs, low resolution, watermark..."
                    className="w-full bg-zinc-950 border border-white/[0.08] focus:border-blue-500/60 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus-visible:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                        Seed Value
                      </label>
                      <button
                        type="button"
                        onClick={() => setLockSeed(!lockSeed)}
                        className={`text-[10px] flex items-center gap-1 cursor-pointer ${
                          lockSeed ? "text-blue-400" : "text-zinc-500 hover:text-zinc-300"
                        }`}
                      >
                        {lockSeed ? <Lock size={10} /> : <Unlock size={10} />}
                        <span>{lockSeed ? "Locked" : "Random"}</span>
                      </button>
                    </div>
                    <input
                      type="number"
                      value={seed}
                      onChange={(e) => {
                        setSeed(e.target.value);
                        setLockSeed(true);
                      }}
                      disabled={isBusy}
                      placeholder="Random (e.g. 428190)"
                      className="w-full bg-zinc-950 border border-white/[0.08] focus:border-blue-500/60 rounded px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 font-mono focus-visible:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-zinc-400 uppercase tracking-wider font-medium">Sampling Steps</span>
                      <span className="text-zinc-400 font-mono">{inferenceSteps}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={inferenceSteps}
                      onChange={(e) => setInferenceSteps(Number(e.target.value))}
                      disabled={isBusy}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Primary Generate Button */}
          <button
            type="button"
            onClick={() => generateImage()}
            disabled={isBusy}
            className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 select-none shadow-md ${
              isBusy
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white shadow-blue-500/10 hover:shadow-blue-500/20"
            }`}
          >
            {isBusy ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>{loadingPhase || "Synthesizing Canvas..."}</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate {gridMode > 1 ? `${gridMode}x Multi-Grid` : "Canvas"}</span>
                <span className="text-[11px] opacity-75 font-mono ml-1 hidden sm:inline">(Ctrl+Enter)</span>
              </>
            )}
          </button>

          {/* Prompt Guide Suggestion Chips */}
          <div className="pt-2 border-t border-white/[0.06] flex flex-col gap-2">
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium flex items-center gap-1">
              <Compass size={12} />
              <span>Prompt Inspirations</span>
            </span>
            <div className="flex flex-col gap-1.5">
              {samplePrompts.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPromptText(prompt);
                    if (inputRef.current) inputRef.current.value = prompt;
                    setErrorMessage("");
                  }}
                  disabled={isBusy}
                  className="text-left text-xs text-zinc-400 hover:text-zinc-200 transition-colors truncate p-1.5 rounded hover:bg-white/[0.04] cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Canvas Display Column */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center w-full">
          <div
            className="w-full relative rounded-xl overflow-hidden bg-zinc-950 border border-white/[0.08] flex items-center justify-center select-none shadow-2xl transition-all"
            style={{
              height: "min(580px, calc(100vh - 120px))",
              maxHeight: "580px",
            }}
          >
            {showCompare && beforeImage && image_url !== "/" ? (
              <BeforeAfterSlider
                beforeImage={beforeImage}
                afterImage={image_url}
                className="w-full h-full"
              />
            ) : gridMode > 1 && batchImages.length > 1 ? (
              <div className={`w-full h-full p-2 grid gap-2 ${gridMode === 2 ? "grid-cols-2" : "grid-cols-2 grid-rows-2"}`}>
                {batchImages.map((bUrl, bIdx) => (
                  <div
                    key={bIdx}
                    onClick={() => setImage_url(bUrl)}
                    className={`relative rounded-lg overflow-hidden border cursor-pointer transition-all ${
                      image_url === bUrl ? "border-blue-500 ring-2 ring-blue-500/30" : "border-white/[0.08] hover:border-white/20"
                    }`}
                  >
                    <img src={bUrl} alt={`Grid variation ${bIdx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/70 px-1.5 py-0.5 rounded text-[9px] font-mono text-white">
                      #{bIdx + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-2">
                <img
                  src={image_url === "/" ? "/favicon.svg" : image_url}
                  alt={currentPrompt || "Canvas output"}
                  className={`max-w-full max-h-full object-contain rounded-lg transition-opacity duration-300 ${
                    image_url === "/" ? "opacity-20 max-w-[120px]" : "opacity-100"
                  } ${isBusy ? "opacity-20 scale-[0.99] blur-xs" : ""}`}
                />
              </div>
            )}

            {/* Empty State Instructions */}
            {image_url === "/" && !isBusy && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-500 mb-3">
                  <ImageIcon size={22} />
                </div>
                <p className="text-sm font-medium text-zinc-300">Your visual output will appear here</p>
                <p className="text-xs text-zinc-400 mt-1 max-w-sm">
                  Enter a descriptive scene prompt on the left and click Generate, or press Ctrl+Enter.
                </p>
              </div>
            )}

            {/* Loading Indicator */}
            {isBusy && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-20 animate-in fade-in duration-200">
                <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <div className="space-y-1 text-center">
                  <p className="text-xs font-medium text-white">{loadingPhase || "Processing..."}</p>
                  <p className="text-[11px] text-zinc-400 max-w-[280px] truncate">"{promptText}"</p>
                </div>
              </div>
            )}

            {/* Inference Badge */}
            {metaInfo && !isBusy && image_url !== "/" && (
              <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md border border-white/[0.08] text-[10px] font-mono text-zinc-300 z-10 pointer-events-none">
                <span className="flex items-center gap-1">
                  <Zap size={11} className="text-zinc-400" />
                  <span>{(metaInfo.durationMs / 1000).toFixed(1)}s</span>
                </span>
                <span>·</span>
                <span>Seed: {metaInfo.seed}</span>
              </div>
            )}

            {/* Quick Action Hub Bar */}
            {!isBusy && image_url !== "/" && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/85 backdrop-blur-md p-1.5 rounded-xl border border-white/[0.1] shadow-xl z-10 flex-wrap max-w-full">
                <button
                  type="button"
                  onClick={() => setIsInpaintOpen(true)}
                  title="Inpainting brush"
                  className="text-zinc-300 hover:text-white hover:bg-white/[0.08] px-2 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  <Paintbrush size={13} className="text-pink-400" />
                  <span className="hidden sm:inline">Inpaint</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditorOpen(true)}
                  title="Studio Editor"
                  className="text-zinc-300 hover:text-white hover:bg-white/[0.08] px-2 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  <Sliders size={13} className="text-blue-400" />
                  <span className="hidden sm:inline">Editor</span>
                </button>

                <button
                  type="button"
                  onClick={handleRemoveBackground}
                  title="Remove background"
                  className="text-zinc-300 hover:text-white hover:bg-white/[0.08] px-2 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  <Scissors size={13} className="text-purple-400" />
                  <span className="hidden sm:inline">Remove BG</span>
                </button>

                <button
                  type="button"
                  onClick={handleUpscale}
                  title="Upscale resolution"
                  className="text-zinc-300 hover:text-white hover:bg-white/[0.08] px-2 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  <Maximize2 size={13} className="text-emerald-400" />
                  <span className="hidden sm:inline">Upscale</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVectorModalOpen(true)}
                  title="Convert to Scalable Vector SVG"
                  className="text-zinc-300 hover:text-white hover:bg-white/[0.08] px-2 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  <FileCode size={13} className="text-emerald-400" />
                  <span className="hidden sm:inline">Vector SVG</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsShareCardOpen(true)}
                  title="Generate Social Share Card"
                  className="text-zinc-300 hover:text-white hover:bg-white/[0.08] px-2 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  <Share2 size={13} className="text-amber-400" />
                  <span className="hidden sm:inline">Card</span>
                </button>

                {beforeImage && (
                  <button
                    type="button"
                    onClick={() => setShowCompare((prev) => !prev)}
                    title="Toggle Before/After Comparison"
                    className={`px-2 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs ${
                      showCompare ? "bg-blue-500/20 text-blue-300 border border-blue-500/40" : "text-zinc-300 hover:text-white hover:bg-white/[0.08]"
                    }`}
                  >
                    <Split size={13} />
                    <span className="hidden sm:inline">Compare</span>
                  </button>
                )}

                <div className="w-px h-3.5 bg-white/[0.1] mx-0.5" />

                <button
                  type="button"
                  onClick={handleCopyImageToClipboard}
                  title="Copy image to clipboard"
                  className="text-zinc-300 hover:text-white hover:bg-white/[0.08] px-2 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  {copiedImage ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span className="hidden sm:inline">{copiedImage ? "Copied" : "Copy"}</span>
                </button>

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

          {/* Color Palette Harmony Bar */}
          {dominantColors.length > 0 && !isBusy && (
            <div className="mt-3.5 flex flex-wrap items-center justify-center gap-3 p-2 px-3 rounded-xl bg-zinc-950/60 border border-white/[0.06] text-xs max-w-lg">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">Palette:</span>
              <div className="flex items-center gap-1.5">
                {dominantColors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => handleCopyHex(color.hex)}
                    className="w-5 h-5 rounded-md border border-white/20 transition-transform hover:scale-110 relative cursor-pointer group"
                    style={{ backgroundColor: color.hex }}
                    title={`Click to copy ${color.hex}`}
                  >
                    {copiedHex === color.hex && (
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black px-1.5 py-0.5 rounded text-[9px] text-white">
                        Copied
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <button
                onClick={handleInjectColorsIntoPrompt}
                className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer transition-colors"
                title="Append palette hex codes into your prompt"
              >
                <Palette size={12} />
                <span>Harmonize in Prompt</span>
              </button>
            </div>
          )}

          {/* Persistent History Vault */}
          {history.length > 0 && (
            <div className="mt-5 w-full space-y-2 border-t border-white/[0.06] pt-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-medium">
                  Session Vault ({history.length})
                </span>
                
                <div className="flex items-center gap-2">
                  {showAddCollection ? (
                    <div className="flex items-center gap-1 bg-zinc-950 border border-white/[0.1] rounded px-1.5 py-0.5 text-xs">
                      <input
                        type="text"
                        value={newCollectionInput}
                        onChange={(e) => setNewCollectionInput(e.target.value)}
                        placeholder="Collection name..."
                        className="bg-transparent text-white text-[11px] w-24 focus:outline-none"
                        onKeyDown={(e) => e.key === "Enter" && handleCreateCollection()}
                      />
                      <button onClick={handleCreateCollection} className="text-blue-400 hover:text-blue-300 text-[10px]">Add</button>
                      <button onClick={() => setShowAddCollection(false)} className="text-zinc-500 hover:text-white text-[10px]">Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowAddCollection(true)}
                      className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                    >
                      <FolderPlus size={11} />
                      <span>New Folder</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (window.confirm("Clear all generation history?")) {
                        setHistory([]);
                        localStorage.removeItem(STORAGE_VAULT_KEY);
                      }
                    }}
                    className="text-[10px] text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Collections Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveCollectionFilter("all")}
                  className={`px-2 py-1 rounded whitespace-nowrap cursor-pointer ${
                    activeCollectionFilter === "all" ? "bg-white/[0.1] text-white font-medium" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  All ({history.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCollectionFilter("favorites")}
                  className={`px-2 py-1 rounded whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                    activeCollectionFilter === "favorites" ? "bg-white/[0.1] text-white font-medium" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Heart size={11} className={activeCollectionFilter === "favorites" ? "text-red-400 fill-red-400" : "text-zinc-400"} />
                  <span>Favorites ({history.filter(h => h.isFavorite).length})</span>
                </button>
                {collections.map((coll) => (
                  <button
                    key={coll}
                    type="button"
                    onClick={() => setActiveCollectionFilter(coll)}
                    className={`px-2 py-1 rounded whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                      activeCollectionFilter === coll ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Folder size={11} className={activeCollectionFilter === coll ? "text-blue-400" : "text-zinc-400"} />
                    <span>{coll} ({history.filter(h => h.collection === coll).length})</span>
                  </button>
                ))}
              </div>

              {/* Vault Thumbnails Carousel */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {filteredHistory.map((item) => (
                  <div key={item.id} className="relative group shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setImage_url(item.url);
                        setCurrentPrompt(item.prompt);
                        if (item.enhanced) setEnhancedPrompt(item.enhanced);
                        if (item.aspectRatio) setSelectedAspectRatio(item.aspectRatio);
                        if (item.model) setSelectedModel(item.model);
                        if (item.seed) setSeed(String(item.seed));
                      }}
                      className={`w-14 h-14 rounded-lg overflow-hidden border transition-all cursor-pointer relative block ${
                        image_url === item.url ? "border-blue-500 ring-2 ring-blue-500/30" : "border-white/[0.08] hover:border-white/20"
                      }`}
                    >
                      <img src={item.url} alt={item.prompt} className="w-full h-full object-cover" />
                      {item.isFavorite && (
                        <span className="absolute top-1 right-1 text-red-500 text-[10px] drop-shadow-sm">
                          <Heart size={9} className="fill-red-500" />
                        </span>
                      )}
                    </button>

                    <div className="absolute -top-1 -right-1 hidden group-hover:flex items-center gap-0.5 bg-black/80 rounded p-0.5 border border-white/20 z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedItem(item);
                        }}
                        className="text-zinc-400 hover:text-white p-0.5"
                        title="Inspect Parameters & Fork"
                      >
                        <GitFork size={10} />
                      </button>
                      <button
                        onClick={(e) => toggleFavorite(item.id, e)}
                        className="text-zinc-400 hover:text-red-400 p-0.5"
                        title="Toggle favorite"
                      >
                        <Heart size={10} className={item.isFavorite ? "fill-red-500 text-red-500" : ""} />
                      </button>
                      <button
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        className="text-zinc-400 hover:text-red-400 p-0.5"
                        title="Delete from history"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Modals */}
      <StudioEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        imageUrl={image_url}
        onApplyToCanvas={(editedDataUrl) => {
          setImage_url(editedDataUrl);
          setSuccessNotice("Adjustments applied to visual canvas.");
          setTimeout(() => setSuccessNotice(""), 3500);
        }}
      />

      <PromptBuilderModal
        isOpen={isPromptBuilderOpen}
        onClose={() => setIsPromptBuilderOpen(false)}
        currentPrompt={promptText}
        onApplyPrompt={(assembled) => {
          setPromptText(assembled);
          if (inputRef.current) inputRef.current.value = assembled;
          setSuccessNotice("Assembled prompt applied.");
          setTimeout(() => setSuccessNotice(""), 3000);
        }}
      />

      <InpaintingCanvasModal
        isOpen={isInpaintOpen}
        onClose={() => setIsInpaintOpen(false)}
        imageUrl={image_url}
        onApplyResult={(inpaintOutput) => {
          setImage_url(inpaintOutput);
          setSuccessNotice("Inpainting applied to canvas.");
          setTimeout(() => setSuccessNotice(""), 3500);
        }}
      />

      <SocialShareCardModal
        isOpen={isShareCardOpen}
        onClose={() => setIsShareCardOpen(false)}
        imageUrl={image_url}
        promptText={currentPrompt}
        modelName={modelsList.find(m => m.id === selectedModel)?.name}
        seed={seed}
        aspectRatio={selectedAspectRatio}
      />

      <VectorConverterModal
        isOpen={isVectorModalOpen}
        onClose={() => setIsVectorModalOpen(false)}
        imageUrl={image_url}
      />

      <DesignTemplatesModal
        isOpen={isDesignTemplatesOpen}
        onClose={() => setIsDesignTemplatesOpen(false)}
        onApplyTemplate={({ prompt, aspectRatio }) => {
          setPromptText(prompt);
          if (inputRef.current) inputRef.current.value = prompt;
          if (aspectRatio) setSelectedAspectRatio(aspectRatio);
          setSuccessNotice("Design template applied.");
          setTimeout(() => setSuccessNotice(""), 3500);
        }}
      />

      <MetadataInspectorModal
        isOpen={!!inspectedItem}
        onClose={() => setInspectedItem(null)}
        item={inspectedItem}
        onForkSettings={(itemToFork) => {
          setImage_url(itemToFork.url);
          setCurrentPrompt(itemToFork.prompt);
          setPromptText(itemToFork.prompt);
          if (inputRef.current) inputRef.current.value = itemToFork.prompt;
          if (itemToFork.enhanced) setEnhancedPrompt(itemToFork.enhanced);
          if (itemToFork.aspectRatio) setSelectedAspectRatio(itemToFork.aspectRatio);
          if (itemToFork.model) setSelectedModel(itemToFork.model);
          if (itemToFork.seed) {
            setSeed(String(itemToFork.seed));
            setLockSeed(true);
          }
          setSuccessNotice("Parameters forked & locked into studio canvas.");
          setTimeout(() => setSuccessNotice(""), 3500);
        }}
      />

    </div>
  );
};

export default ImageGenerator;