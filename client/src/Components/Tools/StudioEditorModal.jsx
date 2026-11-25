import React, { useState, useRef, useEffect } from "react";
import { 
  X, RotateCcw, RotateCw, FlipHorizontal, FlipVertical, 
  Download, Check, Sliders, Type, Undo, Sparkles, Image as ImageIcon 
} from "lucide-react";

const StudioEditorModal = ({ isOpen, onClose, imageUrl, onApplyToCanvas }) => {
  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState("filters"); // filters, transforms, text
  
  // Adjustments state
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [sepia, setSepia] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [blur, setBlur] = useState(0);
  
  // Transforms state
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  
  // Text Overlay state
  const [overlayText, setOverlayText] = useState("");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textSize, setTextSize] = useState(28);
  const [textPosition, setTextPosition] = useState("bottom-right"); // top-left, center, bottom-right
  const [textBg, setTextBg] = useState(true);

  // Compare mode
  const [isComparing, setIsComparing] = useState(false);

  // Redraw canvas whenever adjustments change
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");

      // Set dimensions
      const isRotated90or270 = rotation % 180 !== 0;
      canvas.width = isRotated90or270 ? img.height : img.width;
      canvas.height = isRotated90or270 ? img.width : img.height;

      ctx.save();

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Transforms
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      // Filters
      if (!isComparing) {
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%) grayscale(${grayscale}%) blur(${blur}px)`;
      } else {
        ctx.filter = "none";
      }

      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      // Draw Text Overlay (if not in compare mode)
      if (!isComparing && overlayText.trim()) {
        ctx.save();
        ctx.font = `600 ${textSize}px Inter, sans-serif`;
        const textMetrics = ctx.measureText(overlayText);
        const padding = 14;
        const boxWidth = textMetrics.width + padding * 2;
        const boxHeight = textSize + padding * 1.5;

        let x = canvas.width - boxWidth - 30;
        let y = canvas.height - boxHeight - 30;

        if (textPosition === "top-left") {
          x = 30;
          y = 30;
        } else if (textPosition === "center") {
          x = (canvas.width - boxWidth) / 2;
          y = (canvas.height - boxHeight) / 2;
        }

        // Draw pill background
        if (textBg) {
          ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
          ctx.beginPath();
          ctx.roundRect(x, y, boxWidth, boxHeight, 8);
          ctx.fill();
        }

        ctx.fillStyle = textColor;
        ctx.textBaseline = "middle";
        ctx.fillText(overlayText, x + padding, y + boxHeight / 2);
        ctx.restore();
      }
    };
  }, [
    isOpen, imageUrl, brightness, contrast, saturation, sepia, grayscale, blur, 
    rotation, flipH, flipV, overlayText, textColor, textSize, textPosition, textBg, isComparing
  ]);

  if (!isOpen) return null;

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSepia(0);
    setGrayscale(0);
    setBlur(0);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setOverlayText("");
  };

  const handleApply = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    if (onApplyToCanvas) {
      onApplyToCanvas(dataUrl);
    }
    onClose();
  };

  const handleDownload = (format = "png") => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL(format === "webp" ? "image/webp" : "image/png");
    link.download = `vivid-studio-edit-${Date.now()}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#0e0e14] border border-white/[0.08] rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-zinc-950/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Sliders size={15} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">Studio Creative Editor</h2>
              <p className="text-[11px] text-zinc-500">Fine-tune color grading, transforms, and text overlays</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onMouseDown={() => setIsComparing(true)}
              onMouseUp={() => setIsComparing(false)}
              onTouchStart={() => setIsComparing(true)}
              onTouchEnd={() => setIsComparing(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isComparing 
                  ? "bg-blue-500 text-white border-blue-500" 
                  : "bg-white/[0.04] text-zinc-300 border-white/[0.08] hover:text-white"
              }`}
            >
              Hold to Compare
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/[0.04]"
              title="Reset all adjustments"
            >
              <Undo size={15} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white transition-colors cursor-pointer rounded-lg hover:bg-white/[0.04]"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Body: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden min-h-[460px]">
          
          {/* LEFT: Live Canvas Viewport (7 Cols) */}
          <div className="lg:col-span-7 p-6 flex flex-col items-center justify-center bg-zinc-950/50 border-r border-white/[0.06] overflow-hidden relative">
            <div className="max-w-full max-h-[58vh] flex items-center justify-center rounded-xl overflow-hidden shadow-lg border border-white/[0.08] bg-zinc-950">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[58vh] object-contain transition-all"
              />
            </div>

            {isComparing && (
              <div className="absolute top-8 left-8 px-2.5 py-1 rounded bg-black/80 text-amber-300 text-xs font-mono border border-amber-500/30">
                Viewing Original (Filters Bypassed)
              </div>
            )}
          </div>

          {/* RIGHT: Controls & Tools (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 overflow-y-auto max-h-[70vh] bg-zinc-900/10">
            
            <div className="space-y-6">
              {/* Category Tab Segmented Control */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-zinc-950/80 rounded-lg border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setActiveTab("filters")}
                  className={`py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                    activeTab === "filters" ? "bg-white/[0.1] text-white shadow-xs" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Adjustments
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("transforms")}
                  className={`py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                    activeTab === "transforms" ? "bg-white/[0.1] text-white shadow-xs" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Transforms
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("text")}
                  className={`py-1.5 text-xs font-medium rounded transition-colors cursor-pointer ${
                    activeTab === "text" ? "bg-white/[0.1] text-white shadow-xs" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Watermark & Text
                </button>
              </div>

              {/* TAB 1: FILTERS & SLIDERS */}
              {activeTab === "filters" && (
                <div className="space-y-4">
                  
                  {/* Brightness */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300 font-medium">Brightness</span>
                      <span className="text-zinc-500 font-mono">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="180"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Contrast */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300 font-medium">Contrast</span>
                      <span className="text-zinc-500 font-mono">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="180"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Saturation */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300 font-medium">Saturation</span>
                      <span className="text-zinc-500 font-mono">{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="200"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Warmth / Sepia */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300 font-medium">Vintage Warmth</span>
                      <span className="text-zinc-500 font-mono">{sepia}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={sepia}
                      onChange={(e) => setSepia(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Grayscale */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300 font-medium">Monochrome Grayscale</span>
                      <span className="text-zinc-500 font-mono">{grayscale}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={grayscale}
                      onChange={(e) => setGrayscale(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  {/* Soft Blur */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300 font-medium">Soft Focus Blur</span>
                      <span className="text-zinc-500 font-mono">{blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={blur}
                      onChange={(e) => setBlur(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                </div>
              )}

              {/* TAB 2: TRANSFORMS */}
              {activeTab === "transforms" && (
                <div className="space-y-4">
                  <span className="text-xs text-zinc-400 font-medium">Rotation &amp; Orientation</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                      className="p-3 rounded-lg bg-zinc-950 border border-white/[0.08] hover:border-blue-500/40 text-xs text-zinc-300 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <RotateCcw size={15} />
                      <span>Rotate Left 90°</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRotation((prev) => (prev + 90) % 360)}
                      className="p-3 rounded-lg bg-zinc-950 border border-white/[0.08] hover:border-blue-500/40 text-xs text-zinc-300 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <RotateCw size={15} />
                      <span>Rotate Right 90°</span>
                    </button>
                  </div>

                  <span className="text-xs text-zinc-400 font-medium block pt-2">Mirror Reflections</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFlipH((prev) => !prev)}
                      className={`p-3 rounded-lg border text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                        flipH ? "bg-blue-500/20 border-blue-500 text-white" : "bg-zinc-950 border-white/[0.08] text-zinc-300 hover:text-white"
                      }`}
                    >
                      <FlipHorizontal size={15} />
                      <span>Flip Horizontal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFlipV((prev) => !prev)}
                      className={`p-3 rounded-lg border text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                        flipV ? "bg-blue-500/20 border-blue-500 text-white" : "bg-zinc-950 border-white/[0.08] text-zinc-300 hover:text-white"
                      }`}
                    >
                      <FlipVertical size={15} />
                      <span>Flip Vertical</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: WATERMARK & TEXT OVERLAY */}
              {activeTab === "text" && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-300 font-medium">Overlay Text</label>
                    <input
                      type="text"
                      placeholder="e.g. Created with VividAI"
                      value={overlayText}
                      onChange={(e) => setOverlayText(e.target.value)}
                      maxLength={50}
                      className="w-full p-2.5 rounded-lg bg-zinc-950 border border-white/[0.08] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-300 font-medium">Font Size</span>
                      <span className="text-zinc-500 font-mono">{textSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="60"
                      value={textSize}
                      onChange={(e) => setTextSize(Number(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {["top-left", "center", "bottom-right"].map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setTextPosition(pos)}
                        className={`p-2 text-xs rounded border capitalize transition-colors cursor-pointer ${
                          textPosition === pos ? "bg-blue-500/20 border-blue-500 text-white" : "bg-zinc-950 border-white/[0.08] text-zinc-400 hover:text-white"
                        }`}
                      >
                        {pos.replace("-", " ")}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="text-xs text-zinc-300 flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={textBg}
                        onChange={(e) => setTextBg(e.target.checked)}
                        className="rounded border-zinc-700 text-blue-500 focus:ring-0"
                      />
                      <span>Dark Badge Background</span>
                    </label>

                    <div className="flex items-center gap-1.5">
                      {["#ffffff", "#facc15", "#38bdf8", "#4ade80", "#f43f5e"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setTextColor(c)}
                          style={{ backgroundColor: c }}
                          className={`w-5 h-5 rounded-full border cursor-pointer ${textColor === c ? "ring-2 ring-blue-500" : "border-white/20"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Modal Actions */}
            <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload("png")}
                  className="px-3 py-2 rounded-lg bg-zinc-950 border border-white/[0.08] hover:border-white/[0.2] text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Download edited canvas as PNG"
                >
                  <Download size={13} />
                  <span>PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload("webp")}
                  className="px-3 py-2 rounded-lg bg-zinc-950 border border-white/[0.08] hover:border-white/[0.2] text-xs font-medium text-zinc-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Download web-optimized WebP"
                >
                  <Download size={13} />
                  <span>WebP</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Check size={14} />
                <span>Apply to Studio Canvas</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default StudioEditorModal;
