import React, { useRef, useState, useEffect } from "react";
import { 
  Download, Copy, Check, RefreshCw, X, AlertCircle, Sparkles, 
  Image as ImageIcon, Wand2, Dices, Scissors, Maximize2 
} from "lucide-react";

const samplePrompts = [
  "Architectural interior of a minimalist concrete pavilion with indoor reflective pool, morning sunlight beam",
  "Macro photography of an iridescent emerald beetle on morning dew-covered moss, 85mm lens f/2.8",
  "Studio portrait of an elderly artisan repairing vintage brass clockwork gears, warm focused task light",
  "Nordic coastal fjord at dusk with calm turquoise water reflecting snow-dusted granite peaks",
  "Cybernetic cyber-samurai standing in a rainy Tokyo alley with neon reflections and holographic visor",
  "Ceramic handcrafted matcha bowl resting on dark textured slate stone, Japanese wabi-sabi lighting",
  "Ethereal bioluminescent jellyfish floating through a deep celestial ocean under starlight"
];

const stylePresets = [
  { id: "none", name: "Natural", promptSuffix: "" },
  { id: "cinematic", name: "Cinematic", promptSuffix: ", cinematic film still, moody directional lighting, shallow depth of field, 35mm photograph" },
  { id: "editorial", name: "Editorial", promptSuffix: ", high-fashion editorial studio photography, soft diffuse key light, fine texture" },
  { id: "anime", name: "Anime", promptSuffix: ", Studio Ghibli inspired anime illustration, clean lineart, vibrant watercolor background" },
  { id: "3d", name: "3D Render", promptSuffix: ", clean 3D digital render, soft clay materials, subtle ray-traced shadows" },
  { id: "oil", name: "Oil Painting", promptSuffix: ", classical impasto oil on canvas, expressive textured brushwork, rich shadows" }
];

const aspectRatios = [
  { id: "1:1", label: "1:1", name: "Square", platform: "Post" },
  { id: "16:9", label: "16:9", name: "Landscape", platform: "YouTube" },
  { id: "9:16", label: "9:16", name: "Portrait", platform: "Reel/Story" },
  { id: "4:3", label: "4:3", name: "Classic", platform: "Photo" },
  { id: "3:4", label: "3:4", name: "Vertical", platform: "Pin" },
];

const ImageGenerator = ({ initialPrompt = "", onClearInitialPrompt }) => {
  const [image_url, setImage_url] = useState("/");
  const [loading, setLoading] = useState(false);
  const [toolLoading, setToolLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("none");
  const [selectedAspectRatio, setSelectedAspectRatio] = useState("1:1");
  const [copied, setCopied] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [history, setHistory] = useState([]);
  const [promptText, setPromptText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialPrompt) {
      setPromptText(initialPrompt);
      if (inputRef.current) inputRef.current.value = initialPrompt;
      if (onClearInitialPrompt) onClearInitialPrompt();
      setErrorMessage("");
    }
  }, [initialPrompt]);

  const generateImage = async (overridePrompt) => {
    const rawInput = (overridePrompt || promptText || inputRef.current?.value || "").trim();

    if (!rawInput) {
      setErrorMessage("Please enter a prompt description before generating.");
      if (inputRef.current) inputRef.current.focus();
      return;
    }

    setErrorMessage("");
    setSuccessNotice("");
    const activeStyleObj = stylePresets.find((s) => s.id === selectedStyle);
    const fullPrompt = rawInput + (activeStyleObj?.promptSuffix || "");

    try {
      setLoading(true);
      setLoadingPhase("Optimizing prompt with Qwen 72B...");
      setCurrentPrompt(rawInput);

      const phaseTimer = setTimeout(() => {
        setLoadingPhase(`Synthesizing ${selectedAspectRatio} canvas with FLUX.1...`);
      }, 1400);

      const response = await fetch("http://localhost:5001/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fullPrompt,
          aspectRatio: selectedAspectRatio,
        }),
      });

      clearTimeout(phaseTimer);

      const data = await response.json();

      if (!response.ok || !data.image) {
        throw new Error(data.error || "Generation request failed. Verify backend server is active.");
      }

      const newImageUrl = `data:image/png;base64,${data.image}`;
      setImage_url(newImageUrl);
      if (data.enhancedPrompt) {
        setEnhancedPrompt(data.enhancedPrompt);
      }

      setHistory((prev) => [
        {
          id: Date.now(),
          url: newImageUrl,
          prompt: rawInput,
          enhanced: data.enhancedPrompt,
          aspectRatio: selectedAspectRatio,
        },
        ...prev.slice(0, 7),
      ]);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
      setLoadingPhase("");
    }
  };

  // 1-Click Studio Action: Remove Background
  const handleRemoveBackground = async () => {
    if (image_url === "/" || loading || toolLoading) return;
    try {
      setToolLoading(true);
      setLoadingPhase("Removing background with RMBG AI...");
      setErrorMessage("");

      const base64Clean = image_url.replace(/^data:image\/\w+;base64,/, "");
      const res = await fetch("http://localhost:5001/remove-background", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Clean }),
      });

      const data = await res.json();
      if (!res.ok || !data.image) {
        throw new Error(data.error || "Failed to remove background.");
      }

      const newUrl = `data:image/png;base64,${data.image}`;
      setImage_url(newUrl);
      setSuccessNotice("Background removed! Ready to download as transparent PNG.");
      setTimeout(() => setSuccessNotice(""), 4000);
    } catch (err) {
      setErrorMessage(err.message || "Background removal failed.");
    } finally {
      setToolLoading(false);
      setLoadingPhase("");
    }
  };

  // 1-Click Studio Action: AI Upscale
  const handleUpscale = async () => {
    if (image_url === "/" || loading || toolLoading) return;
    try {
      setToolLoading(true);
      setLoadingPhase("Upscaling details with Clarity AI...");
      setErrorMessage("");

      const base64Clean = image_url.replace(/^data:image\/\w+;base64,/, "");
      const res = await fetch("http://localhost:5001/upscale-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Clean }),
      });

      const data = await res.json();
      if (!res.ok || !data.image) {
        throw new Error(data.error || "Upscale failed.");
      }

      const newUrl = `data:image/png;base64,${data.image}`;
      setImage_url(newUrl);
      setSuccessNotice("Image enhanced with AI Upscaler!");
      setTimeout(() => setSuccessNotice(""), 4000);
    } catch (err) {
      setErrorMessage(err.message || "Image upscaling failed.");
    } finally {
      setToolLoading(false);
      setLoadingPhase("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !loading && !toolLoading) {
      e.preventDefault();
      generateImage();
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

  const handleSampleClick = (prompt) => {
    setPromptText(prompt);
    if (inputRef.current) inputRef.current.value = prompt;
    setErrorMessage("");
    generateImage(prompt);
  };

  const handleClearPrompt = () => {
    setPromptText("");
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
    setErrorMessage("");
  };

  const handleDownload = () => {
    if (image_url === "/") return;
    const link = document.createElement("a");
    link.href = image_url;
    link.download = `vivid-ai-${selectedAspectRatio.replace(":", "-")}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      console.warn("Direct image clipboard not supported, copying prompt instead", err);
      handleCopyPrompt();
    }
  };

  const isBusy = loading || toolLoading;

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-56px)] lg:h-[calc(100vh-56px)] flex items-center justify-center lg:overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full max-h-full">
        
        {/* LEFT COLUMN: Controls Panel (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4 lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto pr-2 scrollbar-none w-full">
          
          {/* Notifications */}
          {errorMessage && (
            <div 
              role="alert" 
              className="p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-200 text-xs flex items-start justify-between gap-3 animate-in fade-in duration-150"
            >
              <div className="flex items-start gap-2">
                <AlertCircle size={15} className="text-red-400 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
              <button 
                onClick={() => setErrorMessage("")}
                aria-label="Dismiss error"
                className="text-red-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {successNotice && (
            <div 
              role="status" 
              className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs flex items-start justify-between gap-3 animate-in fade-in duration-150"
            >
              <div className="flex items-start gap-2">
                <Check size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{successNotice}</span>
              </div>
              <button 
                onClick={() => setSuccessNotice("")}
                aria-label="Dismiss notice"
                className="text-emerald-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Prompt Input Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="prompt-input"
                className="text-xs text-zinc-400 uppercase tracking-wider font-medium flex items-center gap-1.5"
              >
                <span>Prompt Description</span>
              </label>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRandomPrompt}
                  className="text-[11px] text-zinc-400 hover:text-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Generate a random creative prompt"
                >
                  <Dices size={13} />
                  <span>Surprise Me</span>
                </button>
                {promptText.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearPrompt}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <span className="text-[11px] text-zinc-400 font-mono">
                  {promptText.length}/400
                </span>
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
                onKeyDown={handleKeyDown}
                disabled={isBusy}
                aria-label="Image generation prompt input"
                placeholder="Describe your scene in detail... (Press Enter to generate)"
                className="w-full bg-zinc-950/60 border border-white/[0.08] focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 rounded-lg p-3 text-sm text-white placeholder-zinc-500 resize-none disabled:opacity-50 transition-colors focus-visible:outline-none"
              />
            </div>
          </div>

          {/* Aspect Ratio Selector with Platform tags */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
                Aspect Ratio
              </label>
              <span className="text-[11px] text-zinc-400 font-mono">
                {aspectRatios.find(r => r.id === selectedAspectRatio)?.name} ({aspectRatios.find(r => r.id === selectedAspectRatio)?.platform})
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 p-1 rounded-lg bg-zinc-950/60 border border-white/[0.06]">
              {aspectRatios.map((ratio) => {
                const isActive = selectedAspectRatio === ratio.id;
                return (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setSelectedAspectRatio(ratio.id)}
                    disabled={isBusy}
                    className={`px-1.5 py-1.5 text-xs rounded transition-colors cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      isActive
                        ? "bg-white/[0.1] text-white font-semibold shadow-xs"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="font-mono text-xs">{ratio.label}</span>
                    <span className="text-[9px] text-zinc-500 truncate w-full text-center">{ratio.platform}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Style Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-zinc-400 uppercase tracking-wider font-medium">
              Style Preset
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-zinc-950/60 border border-white/[0.06]">
              {stylePresets.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setSelectedStyle(style.id)}
                  disabled={isBusy}
                  className={`px-2.5 py-1.5 text-xs rounded transition-colors cursor-pointer text-center truncate ${
                    selectedStyle === style.id
                      ? "bg-white/[0.1] text-white font-medium shadow-xs"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={() => generateImage()}
            disabled={isBusy || !promptText.trim()}
            aria-busy={isBusy}
            className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 shadow-sm"
          >
            {isBusy ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>{loadingPhase || "Processing..."}</span>
              </>
            ) : (
              <span>Generate Image</span>
            )}
          </button>

          {/* Sample Prompts */}
          <div className="flex flex-col gap-2 pt-1 border-t border-white/[0.06]">
            <span className="text-xs text-zinc-400 font-medium">Curated Prompts</span>
            <div className="flex flex-col gap-1.5">
              {samplePrompts.slice(0, 3).map((prompt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSampleClick(prompt)}
                  disabled={isBusy}
                  className="text-left text-xs text-zinc-400 hover:text-blue-400 cursor-pointer transition-colors p-1.5 rounded hover:bg-white/[0.02] truncate"
                  title={prompt}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Optimized Prompt Banner */}
          {enhancedPrompt && (
            <div className="p-3 rounded-lg bg-zinc-900/30 border border-white/[0.06] text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-zinc-400 font-medium text-[11px] uppercase tracking-wider">
                <Sparkles size={13} className="text-blue-400" />
                <span>Optimized by Qwen 72B</span>
              </div>
              <p className="text-zinc-300 leading-relaxed italic">
                "{enhancedPrompt}"
              </p>
            </div>
          )}

          {/* Session History */}
          {history.length > 0 && (
            <div className="flex flex-col gap-2 pt-1 border-t border-white/[0.06]">
              <span className="text-xs text-zinc-400 font-medium">Session History</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setImage_url(item.url);
                      setCurrentPrompt(item.prompt);
                      setPromptText(item.prompt);
                      setEnhancedPrompt(item.enhanced || "");
                      if (item.aspectRatio) setSelectedAspectRatio(item.aspectRatio);
                    }}
                    title={item.prompt}
                    className={`w-11 h-11 rounded-md overflow-hidden shrink-0 transition-all cursor-pointer border ${
                      image_url === item.url
                        ? "border-blue-500 ring-1 ring-blue-500 scale-105"
                        : "border-white/[0.08] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={item.url} alt="Session history thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Dedicated Studio Canvas + Action Hub (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center h-full w-full">
          
          {/* Dynamic Canvas Container matching Aspect Ratio */}
          <div className={`relative rounded-lg overflow-hidden bg-zinc-950 border border-white/[0.08] flex items-center justify-center transition-all duration-300 ${
            selectedAspectRatio === "16:9"
              ? "w-full max-w-[620px] aspect-video"
              : selectedAspectRatio === "9:16"
              ? "h-[min(500px,calc(100vh-100px))] aspect-[9/16]"
              : selectedAspectRatio === "4:3"
              ? "w-full max-w-[540px] aspect-[4/3]"
              : selectedAspectRatio === "3:4"
              ? "h-[min(500px,calc(100vh-100px))] aspect-[3/4]"
              : "h-[min(500px,calc(100vh-100px))] w-[min(500px,calc(100vh-100px))] aspect-square"
          }`}>
            
            {/* When an image has been generated */}
            {image_url !== "/" ? (
              <img
                src={image_url}
                alt={currentPrompt || "AI generated artwork"}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isBusy ? "opacity-25" : "opacity-100"
                }`}
              />
            ) : (
              /* Intentional Empty State */
              <div className="p-8 text-center flex flex-col items-center justify-center max-w-sm">
                <div className="w-12 h-12 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4 text-zinc-500">
                  <ImageIcon size={22} />
                </div>
                <h2 className="text-sm font-semibold text-white">Visual Canvas</h2>
                <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                  Enter a prompt on the left or click "Surprise Me" to create with FLUX.1.
                </p>
                <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-zinc-400 px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.06]">
                  <span>{selectedAspectRatio} · {aspectRatios.find(r => r.id === selectedAspectRatio)?.name}</span>
                  <span>·</span>
                  <span>FLUX.1-schnell</span>
                </div>
              </div>
            )}

            {/* Loading Overlay with Phase Indicator */}
            {isBusy && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-xs p-6 text-center">
                <div className="w-7 h-7 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-white">{loadingPhase || "Processing..."}</p>
                  <p className="text-[11px] text-zinc-400 max-w-[260px] truncate">
                    "{promptText}"
                  </p>
                </div>
              </div>
            )}

            {/* Direct Studio Action Toolbar on Generated Image */}
            {!isBusy && image_url !== "/" && (
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/80 backdrop-blur-md p-1 rounded-lg border border-white/[0.08] shadow-lg">
                
                {/* 1-Click Background Remover */}
                <button
                  type="button"
                  onClick={handleRemoveBackground}
                  title="Remove background with RMBG AI"
                  className="text-zinc-300 hover:text-white hover:bg-white/[0.08] px-2 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  <Scissors size={13} className="text-blue-400" />
                  <span className="hidden sm:inline">Remove BG</span>
                </button>

                {/* 1-Click AI Upscale */}
                <button
                  type="button"
                  onClick={handleUpscale}
                  title="Upscale image to HD with Clarity AI"
                  className="text-zinc-300 hover:text-white hover:bg-white/[0.08] px-2 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  <Maximize2 size={13} className="text-emerald-400" />
                  <span className="hidden sm:inline">Upscale HD</span>
                </button>

                <div className="w-px h-3.5 bg-white/[0.1] mx-0.5" />

                {/* Copy Image to Clipboard */}
                <button
                  type="button"
                  onClick={handleCopyImageToClipboard}
                  title="Copy image to clipboard"
                  className="text-zinc-300 hover:text-white hover:bg-white/[0.08] px-2 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  {copiedImage ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                  <span className="hidden sm:inline">{copiedImage ? "Copied" : "Copy"}</span>
                </button>

                {/* Download PNG */}
                <button
                  type="button"
                  onClick={handleDownload}
                  title="Download lossless PNG"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1 text-xs font-medium"
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
                className="text-zinc-500 hover:text-white transition-colors shrink-0"
                title="Copy prompt text"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ImageGenerator;