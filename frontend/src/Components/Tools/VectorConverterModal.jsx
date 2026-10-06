import React, { useState, useEffect } from "react";
import { 
  X, Download, Copy, Check, Sparkles, Layers, Sliders, 
  ZoomIn, RefreshCw, AlertCircle, FileCode, Split 
} from "lucide-react";
import { convertImageToSVG } from "../../utils/svgVectorizer";

const VectorConverterModal = ({ isOpen, onClose, imageUrl }) => {
  const [svgData, setSvgData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [colorLevel, setColorLevel] = useState(8); // 4, 8, 16
  const [smoothCurves, setSmoothCurves] = useState(true);
  const [detailThreshold, setDetailThreshold] = useState(30);

  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewOriginal, setViewOriginal] = useState(false);

  // Trigger vector conversion whenever image or settings change
  useEffect(() => {
    if (!isOpen || !imageUrl || imageUrl === "/") return;

    let isMounted = true;
    setLoading(true);
    setErrorMessage("");

    convertImageToSVG(imageUrl, {
      colorCount: colorLevel,
      detailThreshold,
      smoothCurves,
    })
      .then((result) => {
        if (isMounted) {
          setSvgData(result);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Vectorization error:", err);
          setErrorMessage("Failed to vectorize image. Try adjusting the settings.");
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, imageUrl, colorLevel, smoothCurves, detailThreshold]);

  const handleDownloadSVG = () => {
    if (!svgData?.svgString) return;
    const blob = new Blob([svgData.svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `vivid-vector-art-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleCopySVGCode = () => {
    if (!svgData?.svgString) return;
    navigator.clipboard.writeText(svgData.svgString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <FileCode size={16} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Native Vector (SVG) Studio</h2>
              <p className="text-xs text-zinc-400">Convert raster AI artwork into scalable vector paths (Recraft.ai style)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Vector Tuning Settings Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 border-b border-white/[0.04] bg-zinc-950/40 text-xs">
          
          {/* Color Level Presets */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 font-medium">Color Complexity:</span>
            <div className="inline-flex rounded-lg border border-white/[0.08] bg-black/40 p-0.5">
              {[4, 8, 16].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setColorLevel(num)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                    colorLevel === num ? "bg-white/[0.1] text-white font-medium" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {num} Colors
                </button>
              ))}
            </div>
          </div>

          {/* Path Smoothing */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                checked={smoothCurves}
                onChange={(e) => setSmoothCurves(e.target.checked)}
                className="rounded border-zinc-700 text-emerald-500 focus:ring-0"
              />
              <span>Geometric Smoothing</span>
            </label>

            {/* Toggle Original vs Vector */}
            <button
              type="button"
              onClick={() => setViewOriginal(!viewOriginal)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-colors cursor-pointer ${
                viewOriginal
                  ? "bg-blue-500/20 border-blue-500/40 text-blue-300"
                  : "bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white"
              }`}
            >
              <Split size={12} />
              <span>{viewOriginal ? "Showing: Original PNG" : "Showing: Scalable SVG"}</span>
            </button>
          </div>

          {/* Zoom Test Controls */}
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Zoom:</span>
            <div className="inline-flex rounded-lg border border-white/[0.08] bg-black/40 p-0.5 font-mono">
              {[1, 1.5, 2].map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZoomLevel(z)}
                  className={`px-2 py-0.5 rounded text-xs cursor-pointer ${
                    zoomLevel === z ? "bg-white/[0.1] text-white" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {z}x
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Vector Display Stage */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-zinc-950/80 min-h-[380px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
              <p className="text-sm font-medium text-white">Tracing geometric vector paths...</p>
              <p className="text-xs text-zinc-500">Posterizing colors &amp; constructing SVG curves</p>
            </div>
          ) : viewOriginal ? (
            /* Original Raster Image */
            <div 
              className="max-w-full max-h-[440px] rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <img src={imageUrl} alt="Original raster" className="max-h-[440px] w-auto object-contain block" />
            </div>
          ) : svgData ? (
            /* Scalable Vector SVG */
            <div 
              className="max-w-full max-h-[440px] rounded-xl overflow-hidden border border-emerald-500/30 bg-black/40 shadow-2xl transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
              dangerouslySetInnerHTML={{ __html: svgData.svgString }}
            />
          ) : (
            <div className="text-zinc-500 text-xs">No vector data available.</div>
          )}

          {errorMessage && (
            <div className="absolute bottom-20 flex items-center gap-2 text-red-400 bg-red-950/40 border border-red-500/30 px-4 py-2 rounded-lg text-xs">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions Bar */}
        <div className="p-4 px-6 border-t border-white/[0.06] bg-zinc-950/90 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
            {svgData && (
              <>
                <span className="text-emerald-400 flex items-center gap-1">
                  <Check size={12} />
                  <span>Vectorized</span>
                </span>
                <span>·</span>
                <span>{svgData.width}×{svgData.height} px</span>
                <span>·</span>
                <span>{svgData.colorCount} Vector Layers</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleCopySVGCode}
              disabled={!svgData}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-zinc-300 hover:text-white hover:bg-white/[0.1] text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? "Copied SVG XML" : "Copy SVG Code"}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadSVG}
              disabled={!svgData}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white text-xs font-medium transition-all shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
            >
              {downloaded ? (
                <>
                  <Check size={14} className="text-white" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Download Scalable SVG (.svg)</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VectorConverterModal;
