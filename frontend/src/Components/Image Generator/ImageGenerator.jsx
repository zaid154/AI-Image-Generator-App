import React, { useRef, useState, useEffect } from "react";
import { Download, Copy, Check, RefreshCw, X, AlertCircle, Sparkles, Image as ImageIcon } from "lucide-react";
import default_img from "../Assets/claraundben-ai-generated-8622236_1920.jpg";

const samplePrompts = [
  "Architectural interior of a minimalist concrete pavilion with indoor reflective pool, morning sunlight beam",
  "Macro photography of an iridescent emerald beetle on morning dew-covered moss, 85mm lens f/2.8",
  "Studio portrait of an elderly artisan repairing vintage brass clockwork gears, warm focused task light",
  "Nordic coastal fjord at dusk with calm turquoise water reflecting snow-dusted granite peaks"
];

const stylePresets = [
  { id: "none", name: "Natural", promptSuffix: "" },
  { id: "cinematic", name: "Cinematic", promptSuffix: ", cinematic film still, moody directional lighting, shallow depth of field, 35mm photograph" },
  { id: "editorial", name: "Editorial", promptSuffix: ", high-fashion editorial studio photography, soft diffuse key light, fine texture" },
  { id: "anime", name: "Anime", promptSuffix: ", Studio Ghibli inspired anime illustration, clean lineart, vibrant watercolor background" },
  { id: "3d", name: "3D Render", promptSuffix: ", clean 3D digital render, soft clay materials, subtle ray-traced shadows" },
  { id: "oil", name: "Oil Painting", promptSuffix: ", classical impasto oil on canvas, expressive textured brushwork, rich shadows" }
];

const ImageGenerator = ({ initialPrompt = "", onClearInitialPrompt }) => {
  const [image_url, setImage_url] = useState("/");
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("none");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [promptText, setPromptText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
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
    const activeStyleObj = stylePresets.find((s) => s.id === selectedStyle);
    const fullPrompt = rawInput + (activeStyleObj?.promptSuffix || "");

    try {
      setLoading(true);
      setLoadingPhase("Optimizing prompt with Qwen 72B...");
      setCurrentPrompt(rawInput);

      // Phase 2 transition simulation while request is in flight
      const phaseTimer = setTimeout(() => {
        setLoadingPhase("Synthesizing 1024×1024 canvas with FLUX.1...");
      }, 1400);

      const response = await fetch("http://localhost:5001/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fullPrompt,
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

      // Add to session history
      setHistory((prev) => [
        {
          id: Date.now(),
          url: newImageUrl,
          prompt: rawInput,
          enhanced: data.enhancedPrompt,
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      generateImage();
    }
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
    link.download = `vivid-ai-${Date.now()}.png`;
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

  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-56px)] lg:h-[calc(100vh-56px)] flex items-center justify-center lg:overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full max-h-full">
        
        {/* LEFT COLUMN: Controls Panel (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5 lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto pr-2 scrollbar-none w-full">
          
          {/* Inline Error Message */}
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

          {/* Prompt Input Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="prompt-input"
                className="text-xs text-zinc-400 uppercase tracking-wider font-medium"
              >
                Prompt
              </label>
              <div className="flex items-center gap-2">
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
                disabled={loading}
                aria-label="Image generation prompt input"
                placeholder="Describe your scene in detail... (Press Enter to generate)"
                className="w-full bg-zinc-950/60 border border-white/[0.08] focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 rounded-lg p-3 text-sm text-white placeholder-zinc-400 resize-none disabled:opacity-50 transition-colors focus-visible:outline-none"
              />
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
                  disabled={loading}
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
            disabled={loading || !promptText.trim()}
            aria-busy={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Generating...</span>
              </>
            ) : (
              <span>Generate Image</span>
            )}
          </button>

          {/* Prompt Suggestions */}
          <div className="flex flex-col gap-2 pt-1 border-t border-white/[0.06]">
            <span className="text-xs text-zinc-400 font-medium">Sample Prompts</span>
            <div className="flex flex-col gap-1.5">
              {samplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSampleClick(prompt)}
                  disabled={loading}
                  className="text-left text-xs text-zinc-400 hover:text-blue-400 cursor-pointer transition-colors p-1.5 rounded hover:bg-white/[0.02] truncate"
                  title={prompt}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Optimizer Info Banner */}
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

          {/* Session History Thumbnails */}
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

        {/* RIGHT COLUMN: Dedicated Full-Height Art Canvas (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center h-full w-full">
          <div className="relative h-[min(500px,calc(100vh-100px))] w-[min(500px,calc(100vh-100px))] aspect-square rounded-lg overflow-hidden bg-zinc-950 border border-white/[0.08] flex items-center justify-center">
            
            {/* When an image has been generated */}
            {image_url !== "/" ? (
              <img
                src={image_url}
                alt={currentPrompt || "AI generated artwork"}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  loading ? "opacity-25" : "opacity-100"
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
                  Enter a prompt on the left or select a sample to generate a 1024×1024 image with FLUX.1.
                </p>
                <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-zinc-400 px-2.5 py-1 rounded bg-white/[0.03] border border-white/[0.06]">
                  <span>1024 × 1024 px</span>
                  <span>·</span>
                  <span>FLUX.1-schnell</span>
                </div>
              </div>
            )}

            {/* Loading Overlay with Phase Indicator */}
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-xs p-6 text-center">
                <div className="w-7 h-7 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin" />
                <div className="space-y-1">
                  <p className="text-xs font-medium text-white">{loadingPhase || "Generating artwork..."}</p>
                  <p className="text-[11px] text-zinc-400 max-w-[260px] truncate">
                    "{promptText}"
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons Toolbar on image */}
            {!loading && image_url !== "/" && (
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  aria-label="Copy prompt text"
                  title="Copy Prompt"
                  className="bg-black/70 backdrop-blur-md text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 text-xs border border-white/[0.08]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  aria-label="Download image as PNG"
                  title="Download HD PNG"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Caption underneath Canvas */}
          {currentPrompt && !loading && (
            <div className="mt-3 text-xs text-zinc-400 italic truncate max-w-md w-full text-center px-4">
              "{currentPrompt}"
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ImageGenerator;