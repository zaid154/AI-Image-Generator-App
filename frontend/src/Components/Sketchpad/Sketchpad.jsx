import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Paintbrush, Eraser, RotateCcw, Sparkles, Download, 
  ArrowRight, RefreshCw, AlertCircle, FileCode, Split, Sliders, Scissors 
} from "lucide-react";
import api from "../../api/client";
import BeforeAfterSlider from "../Tools/BeforeAfterSlider";
import VectorConverterModal from "../Tools/VectorConverterModal";

const paletteColors = [
  "#ffffff", "#000000", "#3b82f6", "#10b981", "#ef4444", 
  "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"
];

const sampleSketchDoodles = [
  { label: "Mountain Sunset", prompt: "majestic alpine mountain peaks during golden hour sunset with calm reflective lake, photorealistic 8k" },
  { label: "Cyberpunk Alley", prompt: "rain-drenched cyberpunk alleyway with neon signs reflecting on wet asphalt, 35mm cinematic photograph" },
  { label: "Cozy Forest Cabin", prompt: "charming rustic wooden cabin in autumn pine forest with smoke rising from stone chimney, warm lighting" },
  { label: "Tropical Island", prompt: "aerial view of secluded tropical island with turquoise ocean lagoon and coral reef, high resolution" },
];

const Sketchpad = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#3b82f6");
  const [brushSize, setBrushSize] = useState(14);
  const [toolMode, setToolMode] = useState("brush"); // brush, eraser
  const [canvasBg, setCanvasBg] = useState("#000000"); // dark or light

  // Synthesis & Output State
  const [promptText, setPromptText] = useState("majestic alpine mountain peaks with calm lake at sunset, photorealistic 8k");
  const [strength, setStrength] = useState(0.6); // 0.1 to 0.9
  const [loading, setLoading] = useState(false);
  const [outputImage, setOutputImage] = useState(null);
  const [sketchSnapshot, setSketchSnapshot] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showCompare, setShowCompare] = useState(false);
  const [isVectorModalOpen, setIsVectorModalOpen] = useState(false);

  const navigate = useNavigate();

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 512;
    canvas.height = 512;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  // Update canvas background when toggled
  const handleToggleBg = (newBg) => {
    setCanvasBg(newBg);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = newBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDraw = (e) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDraw = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.beginPath();
    }
  };

  const draw = (e) => {
    if (!isDrawing && e.type !== "mousedown" && e.type !== "touchstart") return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordinates(e);

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (toolMode === "eraser") {
      ctx.strokeStyle = canvasBg;
    } else {
      ctx.strokeStyle = currentColor;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = canvasBg;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  // Execute AI Synthesis from Doodle Sketch
  const handleSynthesize = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!promptText.trim()) {
      setErrorMessage("Please enter a description for the scene you are sketching.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setShowCompare(false);

    try {
      const sketchDataUrl = canvas.toDataURL("image/png");
      setSketchSnapshot(sketchDataUrl);

      const data = await api.generateImage({
        prompt: promptText.trim(),
        aspectRatio: "1:1",
        model: "flux-schnell",
        referenceImage: sketchDataUrl,
        referenceStrength: strength,
      });

      const fullUrl = `data:image/png;base64,${data.image}`;
      setOutputImage(fullUrl);
      setShowCompare(true);
    } catch (err) {
      console.error("Sketch synthesis error:", err);
      setErrorMessage(err.message || "Failed to render sketch. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendToStudio = () => {
    if (!outputImage) return;
    localStorage.setItem("vivid_ai_active_image", outputImage);
    localStorage.setItem("vivid_ai_active_prompt", promptText);
    navigate("/");
  };

  const handleDownload = () => {
    if (!outputImage) return;
    const link = document.createElement("a");
    link.href = outputImage;
    link.download = `vivid-sketch-render-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
      
      {/* Page Header */}
      <div className="max-w-2xl mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-2.5">
          <Paintbrush size={13} />
          <span>Krea.ai / Pikaso Style Dual-Canvas</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">AI Live Sketchpad Studio</h1>
        <p className="text-sm text-zinc-400 mt-1 leading-relaxed">
          Draw rough doodles, color zones, or shapes on the left canvas. Our diffusion engine translates your strokes into photorealistic artwork on the right canvas.
        </p>
      </div>

      {/* Main Dual Stage Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ======================================================== */}
        {/* LEFT PANEL: Interactive Drawing Canvas (6 Cols)          */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 bg-zinc-900/30 border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          
          {/* Canvas Tools Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.04]">
            
            {/* Tool Mode Stepper */}
            <div className="inline-flex rounded-lg border border-white/[0.08] bg-black/40 p-0.5">
              <button
                type="button"
                onClick={() => setToolMode("brush")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  toolMode === "brush" ? "bg-white/[0.1] text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Paintbrush size={13} />
                <span>Brush</span>
              </button>
              <button
                type="button"
                onClick={() => setToolMode("eraser")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  toolMode === "eraser" ? "bg-white/[0.1] text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Eraser size={13} />
                <span>Eraser</span>
              </button>
            </div>

            {/* Brush Size Slider */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-mono">Size:</span>
              <input
                type="range"
                min="3"
                max="50"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-20 accent-blue-500 cursor-pointer"
              />
              <span className="text-xs text-zinc-400 font-mono w-6">{brushSize}px</span>
            </div>

            {/* Clear & Canvas Background */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleBg(canvasBg === "#000000" ? "#ffffff" : "#000000")}
                className="text-[11px] text-zinc-400 hover:text-white px-2 py-1 rounded bg-white/[0.04] border border-white/[0.06] cursor-pointer"
                title="Toggle canvas background color"
              >
                {canvasBg === "#000000" ? "Dark BG" : "Light BG"}
              </button>

              <button
                type="button"
                onClick={clearCanvas}
                className="text-[11px] text-zinc-500 hover:text-red-400 flex items-center gap-1 cursor-pointer transition-colors"
                title="Reset canvas"
              >
                <RotateCcw size={12} />
                <span>Clear</span>
              </button>
            </div>

          </div>

          {/* Color Palette Swatches */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-mono text-zinc-500">Color:</span>
            {paletteColors.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => {
                  setCurrentColor(hex);
                  setToolMode("brush");
                }}
                className={`w-6 h-6 rounded-md border transition-transform cursor-pointer shrink-0 ${
                  currentColor === hex && toolMode === "brush" ? "scale-125 border-white ring-2 ring-blue-500" : "border-white/20"
                }`}
                style={{ backgroundColor: hex }}
              />
            ))}
            <input
              type="color"
              value={currentColor}
              onChange={(e) => {
                setCurrentColor(e.target.value);
                setToolMode("brush");
              }}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              title="Custom hex color"
            />
          </div>

          {/* Drawing Canvas Area */}
          <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl bg-black flex items-center justify-center">
            <canvas
              ref={canvasRef}
              onMouseDown={startDraw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onMouseMove={draw}
              onTouchStart={startDraw}
              onTouchEnd={stopDraw}
              onTouchMove={draw}
              className="w-full h-full block cursor-crosshair touch-none"
            />
          </div>

          {/* Prompt Input & Presets Bar */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
              Scene Art Direction:
            </label>
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Describe what your rough sketch represents..."
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-white/[0.08] text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500/50"
            />

            {/* Quick Inspiration Doodles */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {sampleSketchDoodles.map((sample, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPromptText(sample.prompt)}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/[0.12] transition-colors cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>

            {/* Strength Control & Render Button */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-mono">Doodle Fidelity:</span>
                <input
                  type="range"
                  min="0.2"
                  max="0.8"
                  step="0.05"
                  value={strength}
                  onChange={(e) => setStrength(Number(e.target.value))}
                  className="w-24 accent-blue-500 cursor-pointer"
                />
                <span className="text-xs text-blue-400 font-mono">{Math.round(strength * 100)}%</span>
              </div>

              <button
                type="button"
                onClick={handleSynthesize}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-medium transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>{loading ? "Synthesizing..." : "Render with AI"}</span>
              </button>
            </div>

            {errorMessage && (
              <div className="p-2 rounded bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle size={13} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

        </div>

        {/* ======================================================== */}
        {/* RIGHT PANEL: Photorealistic AI Synthesis Stage (6 Cols)   */}
        {/* ======================================================== */}
        <div className="lg:col-span-6 bg-zinc-900/30 border border-white/[0.06] rounded-2xl p-5 flex flex-col gap-4 shadow-xl">
          
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-blue-400" />
              <span>Photorealistic AI Synthesis</span>
            </span>

            {outputImage && (
              <button
                type="button"
                onClick={() => setShowCompare(!showCompare)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs border transition-colors cursor-pointer ${
                  showCompare ? "bg-blue-500/20 border-blue-500/40 text-blue-300" : "border-white/[0.08] text-zinc-400 hover:text-white"
                }`}
              >
                <Split size={12} />
                <span>Compare Doodle</span>
              </button>
            )}
          </div>

          {/* Output Display Container */}
          <div className="relative aspect-square w-full rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl bg-zinc-950 flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center gap-3 p-6 text-center">
                <div className="w-10 h-10 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin" />
                <p className="text-sm font-medium text-white">Synthesizing photorealistic visual...</p>
                <p className="text-xs text-zinc-500">Mapping your brush strokes with FLUX.1 neural diffusion</p>
              </div>
            ) : outputImage ? (
              showCompare && sketchSnapshot ? (
                /* Before/After Split Comparison */
                <BeforeAfterSlider
                  beforeImage={sketchSnapshot}
                  afterImage={outputImage}
                  beforeLabel="Your Doodle"
                  afterLabel="Photorealistic AI"
                />
              ) : (
                <img src={outputImage} alt="Synthesized artwork" className="w-full h-full object-cover" />
              )
            ) : (
              <div className="p-8 text-center flex flex-col items-center justify-center max-w-sm">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mb-3 text-zinc-500">
                  <Sparkles size={22} />
                </div>
                <h3 className="text-sm font-semibold text-white">Live AI Canvas Waiting</h3>
                <p className="text-xs text-zinc-500 mt-1">
                  Draw any shapes on the left and click "Render with AI" to generate.
                </p>
              </div>
            )}
          </div>

          {/* Action Bar */}
          {outputImage && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsVectorModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-xs font-medium cursor-pointer transition-colors"
                >
                  <FileCode size={13} />
                  <span>Convert to SVG</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSendToStudio}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 hover:text-white text-xs font-medium border border-white/[0.08] cursor-pointer transition-colors"
                >
                  <span>Open in Studio</span>
                  <ArrowRight size={13} />
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium cursor-pointer shadow-sm transition-colors"
                >
                  <Download size={14} />
                  <span>Download PNG</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Scalable Vector SVG Studio Modal */}
      <VectorConverterModal
        isOpen={isVectorModalOpen}
        onClose={() => setIsVectorModalOpen(false)}
        imageUrl={outputImage}
      />

    </div>
  );
};

export default Sketchpad;
