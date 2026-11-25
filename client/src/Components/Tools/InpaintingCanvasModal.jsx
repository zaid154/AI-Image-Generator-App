import React, { useState, useRef, useEffect } from "react";
import { 
  X, Paintbrush, Eraser, RotateCcw, Sparkles, Check, Download, 
  Split, AlertCircle, ArrowRight 
} from "lucide-react";
import api from "../../api/client";
import BeforeAfterSlider from "./BeforeAfterSlider";

const quickInpaintPresets = [
  "Remove object and seamlessly blend background scenery",
  "A glowing golden floral bloom",
  "Cyberpunk neon holographic glow",
  "Vintage retro sunglasses",
  "Delicate butterfly perched gently",
];

const InpaintingCanvasModal = ({ isOpen, onClose, imageUrl, onApplyResult }) => {
  const containerRef = useRef(null);
  const imageCanvasRef = useRef(null);
  const maskCanvasRef = useRef(null);

  const [brushSize, setBrushSize] = useState(25);
  const [toolMode, setToolMode] = useState("brush"); // brush, eraser
  const [inpaintPrompt, setInpaintPrompt] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasMask, setHasMask] = useState(false);

  const [processing, setProcessing] = useState(false);
  const [resultImage, setResultImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [viewCompare, setViewCompare] = useState(false);

  // Initialize canvas with source image
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    setResultImage(null);
    setHasMask(false);
    setErrorMessage("");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const imgCanvas = imageCanvasRef.current;
      const maskCanvas = maskCanvasRef.current;
      if (!imgCanvas || !maskCanvas) return;

      // Fit within max 700x500 box while preserving aspect ratio
      const maxW = 700;
      const maxH = 500;
      let w = img.width;
      let h = img.height;

      const scale = Math.min(maxW / w, maxH / h, 1);
      const canvasW = Math.round(w * scale);
      const canvasH = Math.round(h * scale);

      imgCanvas.width = canvasW;
      imgCanvas.height = canvasH;
      maskCanvas.width = canvasW;
      maskCanvas.height = canvasH;

      const imgCtx = imgCanvas.getContext("2d");
      imgCtx.clearRect(0, 0, canvasW, canvasH);
      imgCtx.drawImage(img, 0, 0, canvasW, canvasH);

      const maskCtx = maskCanvas.getContext("2d");
      maskCtx.clearRect(0, 0, canvasW, canvasH);
    };
  }, [isOpen, imageUrl]);

  const getCanvasCoords = (e) => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return { x: 0, y: 0 };
    const rect = maskCanvas.getBoundingClientRect();
    const scaleX = maskCanvas.width / rect.width;
    const scaleY = maskCanvas.height / rect.height;

    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const maskCanvas = maskCanvasRef.current;
    if (maskCanvas) {
      const ctx = maskCanvas.getContext("2d");
      ctx.beginPath();
    }
  };

  const draw = (e) => {
    if (!isDrawing && e.type !== "mousedown" && e.type !== "touchstart") return;
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;

    const ctx = maskCanvas.getContext("2d");
    const { x, y } = getCanvasCoords(e);

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (toolMode === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = "rgba(239, 68, 68, 0.65)"; // semi-transparent red mask
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    setHasMask(true);
  };

  const clearMask = () => {
    const maskCanvas = maskCanvasRef.current;
    if (!maskCanvas) return;
    const ctx = maskCanvas.getContext("2d");
    ctx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    setHasMask(false);
  };

  const handleExecuteInpaint = async () => {
    if (!hasMask) {
      setErrorMessage("Please paint a mask over the area you want to modify.");
      return;
    }

    const imgCanvas = imageCanvasRef.current;
    const maskCanvas = maskCanvasRef.current;
    if (!imgCanvas || !maskCanvas) return;

    setProcessing(true);
    setErrorMessage("");

    try {
      // Create binary black & white mask
      const binCanvas = document.createElement("canvas");
      binCanvas.width = maskCanvas.width;
      binCanvas.height = maskCanvas.height;
      const binCtx = binCanvas.getContext("2d");

      // Fill black background
      binCtx.fillStyle = "#000000";
      binCtx.fillRect(0, 0, binCanvas.width, binCanvas.height);

      // Draw mask in white
      binCtx.drawImage(maskCanvas, 0, 0);
      const maskData = binCtx.getImageData(0, 0, binCanvas.width, binCanvas.height);
      for (let i = 0; i < maskData.data.length; i += 4) {
        if (maskData.data[i + 3] > 20) {
          maskData.data[i] = 255;
          maskData.data[i + 1] = 255;
          maskData.data[i + 2] = 255;
          maskData.data[i + 3] = 255;
        } else {
          maskData.data[i] = 0;
          maskData.data[i + 1] = 0;
          maskData.data[i + 2] = 0;
          maskData.data[i + 3] = 255;
        }
      }
      binCtx.putImageData(maskData, 0, 0);

      const base64Image = imgCanvas.toDataURL("image/png");
      const base64Mask = binCanvas.toDataURL("image/png");

      const promptToUse = inpaintPrompt.trim() || "seamlessly erase object and restore natural background texture";

      const data = await api.inpaintImage({
        image: base64Image,
        mask: base64Mask,
        prompt: promptToUse,
      });

      setResultImage(`data:image/png;base64,${data.image}`);
      setViewCompare(true);
    } catch (err) {
      console.error("Inpaint error:", err);
      setErrorMessage(err.message || "Inpainting generation failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleApplyToStudio = () => {
    if (!resultImage) return;
    if (onApplyResult) {
      onApplyResult(resultImage);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-5xl max-h-[92vh] bg-[#0c0c12] border border-white/[0.08] rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center">
              <Paintbrush size={16} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">AI Inpainting &amp; Object Magic Fill</h2>
              <p className="text-xs text-zinc-400">Brush over any object or area to replace, enhance, or erase it with generative fill</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 border-b border-white/[0.04] bg-zinc-950/40">
          
          {/* Tool switchers */}
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-lg border border-white/[0.08] bg-black/40 p-0.5">
              <button
                type="button"
                onClick={() => setToolMode("brush")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  toolMode === "brush" ? "bg-white/[0.1] text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                <Paintbrush size={13} />
                <span>Mask Brush</span>
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

            {/* Brush size stepper */}
            <div className="flex items-center gap-2 pl-2">
              <span className="text-xs text-zinc-400 font-mono">Size:</span>
              <input
                type="range"
                min="6"
                max="80"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-24 accent-pink-500 cursor-pointer"
              />
              <span className="text-xs text-zinc-400 font-mono w-6">{brushSize}px</span>
            </div>

            {hasMask && (
              <button
                type="button"
                onClick={clearMask}
                className="text-xs text-zinc-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer pl-2"
              >
                <RotateCcw size={12} />
                <span>Clear Mask</span>
              </button>
            )}
          </div>

          {resultImage && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewCompare(!viewCompare)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                  viewCompare
                    ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                    : "border-white/[0.08] text-zinc-400 hover:text-white"
                }`}
              >
                <Split size={13} />
                <span>Compare Before/After</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Work Area */}
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center bg-zinc-950/80 min-h-[380px]">
          
          {/* Comparison Mode */}
          {resultImage && viewCompare ? (
            <div className="h-[420px] w-full max-w-2xl rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl">
              <BeforeAfterSlider
                beforeImage={imageUrl}
                afterImage={resultImage}
                beforeLabel="Original"
                afterLabel="Generative Fill"
              />
            </div>
          ) : (
            /* Interactive Drawing Area */
            <div 
              ref={containerRef}
              className="relative rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl select-none"
              style={{ cursor: toolMode === "eraser" ? "crosshair" : "crosshair" }}
            >
              <canvas ref={imageCanvasRef} className="block" />
              <canvas
                ref={maskCanvasRef}
                onMouseDown={startDrawing}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onMouseMove={draw}
                onTouchStart={startDrawing}
                onTouchEnd={stopDrawing}
                onTouchMove={draw}
                className="absolute inset-0 block touch-none"
              />

              {/* Status Overlay */}
              {processing && (
                <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-zinc-700 border-t-pink-500 animate-spin" />
                  <p className="text-sm font-medium text-white">Synthesizing Generative Fill...</p>
                  <p className="text-xs text-zinc-400">Diffusion model is blending the masked region seamlessly</p>
                </div>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-950/40 border border-red-500/30 px-4 py-2 rounded-lg text-xs">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

        </div>

        {/* Inpaint Prompt & Actions Bar */}
        <div className="p-5 border-t border-white/[0.06] bg-zinc-950/90 space-y-3">
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Magic Fill Instruction / Replacement Prompt:
              </label>
              <span className="text-[11px] text-zinc-500">Leave blank to erase object and blend background</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inpaintPrompt}
                onChange={(e) => setInpaintPrompt(e.target.value)}
                placeholder="e.g. seamless object removal, or: a pair of golden aviator sunglasses..."
                className="flex-1 px-4 py-2 rounded-xl bg-black/70 border border-white/[0.08] text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-pink-500/50"
              />

              <button
                type="button"
                onClick={handleExecuteInpaint}
                disabled={processing}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 active:bg-pink-700 text-white text-xs font-medium transition-all shadow-md shadow-pink-500/20 cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={14} />
                <span>Generate Fill</span>
              </button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {quickInpaintPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setInpaintPrompt(preset)}
                  className="text-[11px] px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-zinc-400 hover:text-white hover:border-white/[0.12] transition-colors cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Bottom Bar */}
          {resultImage && (
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                <Check size={14} />
                <span>Generative inpainting completed successfully</span>
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleApplyToStudio}
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-all shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  <span>Apply to Studio Canvas</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default InpaintingCanvasModal;
