import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Upload, X, RefreshCw, AlertCircle, Image as ImageIcon, Download, 
  Check, Maximize2, Sparkles, Layers, Shield, Split, Sliders, ArrowRight 
} from "lucide-react";
import api from "../../api/client";
import BeforeAfterSlider from "./BeforeAfterSlider";
import StudioEditorModal from "./StudioEditorModal";

const ImageUpscaler = () => {
  const [state, setState] = useState("idle"); // idle, uploading, processing, done, error
  const [originalImage, setOriginalImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [fileInfo, setFileInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [viewMode, setViewMode] = useState("split"); // split, side-by-side
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setState("error");
      setErrorMessage("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    processFile(file);
  };

  const processFile = (file) => {
    setState("uploading");
    setFileInfo({
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
    });

    const reader = new FileReader();

    reader.onload = async (e) => {
      const base64DataURL = e.target.result;
      setOriginalImage(base64DataURL);

      const base64String = base64DataURL.split(",")[1];

      setState("processing");
      try {
        const data = await api.upscaleImage(base64String);
        setResultImage(`data:image/png;base64,${data.image}`);
        setState("done");
      } catch (error) {
        setState("error");
        setErrorMessage(error.message || "Failed to upscale image. Please try again.");
        console.error(error);
      }
    };

    reader.onerror = () => {
      setState("error");
      setErrorMessage("Failed to read file.");
    };

    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type.startsWith("image/")) {
        processFile(file);
      } else {
        setState("error");
        setErrorMessage("Please drop an image file.");
      }
    }
  };

  const reset = () => {
    setState("idle");
    setOriginalImage(null);
    setResultImage(null);
    setFileInfo(null);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const link = document.createElement("a");
    link.href = resultImage;
    link.download = `clarity-upscaled-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendToStudio = () => {
    if (!resultImage) return;
    localStorage.setItem("vivid_ai_active_image", resultImage);
    navigate("/");
  };

  const handleApplyEditor = (editedDataUrl) => {
    setResultImage(editedDataUrl);
    setIsEditorOpen(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Header */}
      <div className="max-w-2xl mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
          <Maximize2 size={13} />
          <span>Clarity AI Upscaler Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">AI Image Upscaler</h1>
        <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
          Enhance low-resolution photos and generated artwork to high-definition clarity. Reconstructs lost micro-textures and sharpens edges without noise.
        </p>
      </div>

      {/* Upload Zone / Workspace */}
      <div className="bg-zinc-900/20 border border-white/[0.06] rounded-xl p-6 sm:p-8 mb-12">
        {(state === "idle" || state === "error") && (
          <div
            className="w-full border-2 border-dashed border-white/[0.08] hover:border-emerald-500/50 rounded-xl bg-zinc-950/40 p-12 text-center transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[320px]"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4 text-zinc-400">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-white font-medium text-base mb-1">Click to upload or drag &amp; drop</p>
            <p className="text-zinc-500 text-xs">Supports PNG, JPG, WEBP up to 25MB</p>

            {state === "error" && (
              <div className="mt-6 flex items-center gap-2 text-red-400 bg-red-950/40 border border-red-500/30 px-4 py-2.5 rounded-lg text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {(state === "uploading" || state === "processing") && (
          <div className="flex flex-col items-center justify-center min-h-[340px] text-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-zinc-800 border-t-emerald-500 animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium text-white">
                {state === "uploading" ? "Preparing image..." : "Synthesizing high-res details with Clarity AI..."}
              </p>
              <p className="text-xs text-zinc-500">
                {fileInfo ? `${fileInfo.name} (${fileInfo.size})` : "Enhancing dynamic range and pixel density"}
              </p>
            </div>
          </div>
        )}

        {state === "done" && (
          <div className="space-y-6">
            
            {/* View Mode Switcher */}
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.04]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Comparison Mode:</span>
                <div className="inline-flex rounded-lg border border-white/[0.08] bg-black/40 p-0.5">
                  <button
                    onClick={() => setViewMode("split")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      viewMode === "split"
                        ? "bg-white/[0.1] text-white"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Split size={13} />
                    <span>Split Slider</span>
                  </button>
                  <button
                    onClick={() => setViewMode("side-by-side")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      viewMode === "side-by-side"
                        ? "bg-white/[0.1] text-white"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <ImageIcon size={13} />
                    <span>Side by Side</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditorOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-zinc-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                  title="Tune brightness, contrast, rotate, or add text"
                >
                  <Sliders size={13} />
                  <span>Fine-tune &amp; Edit</span>
                </button>
              </div>
            </div>

            {/* Split Slider View */}
            {viewMode === "split" && (
              <div className="h-[460px] max-w-2xl mx-auto rounded-xl overflow-hidden border border-white/[0.08] bg-zinc-950">
                <BeforeAfterSlider
                  beforeImage={originalImage}
                  afterImage={resultImage}
                  beforeLabel="Original Low-Res"
                  afterLabel="Clarity AI HD"
                />
              </div>
            )}

            {/* Side-by-side View */}
            {viewMode === "side-by-side" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* Original Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-mono">Original</span>
                    {fileInfo && <span className="text-[11px] text-zinc-500">{fileInfo.size}</span>}
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden bg-zinc-950 border border-white/[0.08] flex items-center justify-center">
                    <img src={originalImage} alt="Original" className="w-full h-full object-contain" />
                  </div>
                </div>

                {/* Upscaled Result Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-400 uppercase tracking-wider font-mono">Clarity HD Output</span>
                    <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Enhanced
                    </span>
                  </div>
                  <div className="aspect-square rounded-lg overflow-hidden bg-zinc-950 border border-white/[0.08] flex items-center justify-center">
                    <img src={resultImage} alt="Upscaled Result" className="w-full h-full object-contain" />
                  </div>
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/[0.06]">
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Upscale another image</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSendToStudio}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] text-zinc-200 hover:text-white font-medium text-xs transition-colors cursor-pointer"
                  title="Open this upscaled image directly on the Studio canvas"
                >
                  <span>Open in Studio</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <Download size={15} />
                  <span>Download Enhanced HD Image</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl bg-zinc-900/20 border border-white/[0.05]">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
            <Sparkles size={18} />
          </div>
          <h3 className="text-sm font-semibold text-white">Super-Resolution Fidelity</h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Neural networks generate missing high-frequency details instead of basic pixel-stretching interpolation.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/20 border border-white/[0.05]">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
            <Layers size={18} />
          </div>
          <h3 className="text-sm font-semibold text-white">Artifact Reduction</h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Removes JPEG compression blocks, chromatic aberrations, and blurriness from vintage or web photos.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/20 border border-white/[0.05]">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
            <Shield size={18} />
          </div>
          <h3 className="text-sm font-semibold text-white">Lossless PNG Export</h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Output is exported as uncompressed PNG ready for commercial print, banners, or design workflows.
          </p>
        </div>
      </div>

      {/* In-Browser Studio Photo Editor */}
      <StudioEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        imageUrl={resultImage}
        onApplyToCanvas={handleApplyEditor}
      />

    </div>
  );
};

export default ImageUpscaler;
