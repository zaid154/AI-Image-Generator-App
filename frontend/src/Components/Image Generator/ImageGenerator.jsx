import React, { useRef, useState, useEffect } from "react";
import { Download, Copy, Check, RefreshCw } from "lucide-react";
import default_img from "../Assets/claraundben-ai-generated-8622236_1920.jpg";

const samplePrompts = [
  "Futuristic transparent smartphone with glowing holographic display",
  "Cute neon cyberpunk kitten in a rainy Tokyo street at night",
  "Astronaut floating near a glowing purple nebula in deep space",
  "Concept supercar driving through a neon sunset desert highway",
  "Mystical castle floating on clouds with waterfalls at sunrise"
];

const stylePresets = [
  { id: "none", name: "Original", promptSuffix: "" },
  { id: "realistic", name: "Photorealistic", promptSuffix: ", 8k resolution, cinematic lighting, 85mm photography, highly detailed photorealistic" },
  { id: "anime", name: "Anime", promptSuffix: ", anime art style, vibrant studio ghibli aesthetic, masterpiece, sharp outlines" },
  { id: "cyberpunk", name: "Cyberpunk", promptSuffix: ", cyberpunk style, neon volumetric lights, high-tech dystopian city, octane render" },
  { id: "3d", name: "3D Render", promptSuffix: ", 3D render, Pixar style, octane render, smooth clay textures, ray tracing" },
  { id: "oil", name: "Oil Painting", promptSuffix: ", classic oil painting, rich textured brush strokes, dramatic chiaroscuro masterpiece" }
];

const ImageGenerator = ({ initialPrompt = "", onClearInitialPrompt }) => {
  const [image_url, setImage_url] = useState("/");
  const [loading, setLoading] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("none");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [promptText, setPromptText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (initialPrompt) {
      setPromptText(initialPrompt);
      if (inputRef.current) inputRef.current.value = initialPrompt;
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

  const generateImage = async (overridePrompt) => {
    const rawInput = (overridePrompt || promptText || inputRef.current?.value || "").trim();

    if (!rawInput) {
      alert("Please enter a prompt!");
      return;
    }

    const activeStyleObj = stylePresets.find((s) => s.id === selectedStyle);
    const fullPrompt = rawInput + (activeStyleObj?.promptSuffix || "");

    try {
      setLoading(true);
      setCurrentPrompt(rawInput);

      const response = await fetch("http://localhost:5001/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: fullPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.image) {
        throw new Error(data.error || "Image generation failed");
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
      alert(error.message || "Failed to generate image. Please try again.");
    } finally {
      setLoading(false);
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
    generateImage(prompt);
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
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-4 h-[calc(100vh-56px)] flex items-center justify-center overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full max-h-full">
        
        {/* LEFT COLUMN: Controls Panel (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5 max-h-[calc(100vh-80px)] overflow-y-auto pr-2 scrollbar-none w-full">
          
          {/* Prompt Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-500 uppercase tracking-wide font-medium">
                Prompt
              </label>
              <span className="text-xs text-zinc-600 font-mono">
                FLUX.1-schnell
              </span>
            </div>

            <textarea
              ref={inputRef}
              rows={3}
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Describe what you want to see..."
              className="w-full bg-transparent border border-white/[0.08] rounded-lg p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 resize-none disabled:opacity-50"
            />
          </div>

          {/* Style Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-zinc-500 uppercase tracking-wide font-medium">
              Style
            </label>
            <div className="inline-flex flex-wrap rounded-lg border border-white/[0.08] overflow-hidden">
              {stylePresets.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setSelectedStyle(style.id)}
                  disabled={loading}
                  className={`px-3 py-1.5 text-xs transition-colors cursor-pointer flex-1 text-center border-r border-white/[0.08] last:border-r-0 ${
                    selectedStyle === style.id
                      ? "bg-white/[0.08] text-white"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {style.name}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={() => generateImage()}
            disabled={loading || !promptText.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-medium py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
            ) : (
              <span>Generate</span>
            )}
          </button>

          {/* Quick Prompts */}
          <div className="flex flex-col gap-2">
            <div className="h-px w-full bg-white/[0.06] my-1"></div>
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-zinc-500 mb-1">Try</span>
              {samplePrompts.slice(0, 3).map((prompt, index) => (
                <span
                  key={index}
                  onClick={() => handleSampleClick(prompt)}
                  className="text-xs text-zinc-500 hover:text-blue-400 cursor-pointer transition-colors block"
                >
                  {prompt}
                </span>
              ))}
            </div>
          </div>

          {/* Prompt Auto-Correction */}
          {enhancedPrompt && (
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-xs text-zinc-500">Enhanced:</span>
              <p className="text-xs text-zinc-400 italic">
                {enhancedPrompt}
              </p>
            </div>
          )}

          {/* Session History Thumbnails */}
          {history.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              <span className="text-xs text-zinc-500">History</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setImage_url(item.url);
                      setCurrentPrompt(item.prompt);
                      setPromptText(item.prompt);
                      setEnhancedPrompt(item.enhanced || "");
                    }}
                    className={`w-10 h-10 rounded-md overflow-hidden shrink-0 transition-all cursor-pointer ${
                      image_url === item.url
                        ? "ring-1 ring-blue-500 scale-105"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={item.url} alt="History thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Dedicated Full-Height Art Canvas (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center h-full w-full">
          <div className="relative h-[min(500px,calc(100vh-100px))] w-[min(500px,calc(100vh-100px))] aspect-square rounded-lg overflow-hidden bg-zinc-900/50 border border-white/[0.06] flex items-center justify-center">
            
            {/* The Image */}
            <img
              src={image_url === "/" ? default_img : image_url}
              alt="Generated Art"
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                loading ? "opacity-30" : "opacity-100"
              }`}
            />

            {/* Loading Overlay */}
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 rounded-full border-2 border-zinc-600 border-t-blue-500 animate-spin"></div>
                <span className="text-sm text-zinc-400">Generating...</span>
              </div>
            )}

            {/* Action Buttons Toolbar on image */}
            {!loading && image_url !== "/" && (
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <button
                  onClick={handleCopyPrompt}
                  title="Copy Prompt"
                  className="bg-black/60 backdrop-blur-sm text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                <button
                  onClick={handleDownload}
                  title="Download"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-2.5 py-1.5 rounded-md transition-colors cursor-pointer flex items-center justify-center"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Caption underneath Canvas */}
          {currentPrompt && !loading && (
            <div className="mt-3 text-xs text-zinc-600 italic truncate max-w-md w-full text-center">
              {currentPrompt}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ImageGenerator;