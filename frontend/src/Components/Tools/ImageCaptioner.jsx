import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Upload, X, RefreshCw, AlertCircle, Image as ImageIcon, Copy, Wand2, 
  Check, Sparkles, Brain, Eye, Dices, ArrowRight 
} from "lucide-react";
import api from "../../api/client";

const ImageCaptioner = ({ onSelectPrompt }) => {
  const [state, setState] = useState("idle"); // idle, uploading, processing, done, error
  const [originalImage, setOriginalImage] = useState(null);
  const [caption, setCaption] = useState("");
  const [expandedPrompt, setExpandedPrompt] = useState("");
  const [variations, setVariations] = useState(null);
  const [expanding, setExpanding] = useState(false);
  const [varying, setVarying] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);
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
    const reader = new FileReader();

    reader.onload = async (e) => {
      const base64DataURL = e.target.result;
      setOriginalImage(base64DataURL);

      const base64String = base64DataURL.split(",")[1];

      setState("processing");
      try {
        const data = await api.captionImage(base64String);
        setCaption(data.caption);
        setExpandedPrompt("");
        setVariations(null);
        setState("done");
      } catch (error) {
        setState("error");
        setErrorMessage(error.message || "Failed to extract prompt. Please try again.");
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
    setCaption("");
    setExpandedPrompt("");
    setVariations(null);
    setErrorMessage("");
    setCopied(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUsePrompt = (promptToUse) => {
    if (onSelectPrompt) onSelectPrompt(promptToUse);
    navigate("/");
  };

  const handleExpandPrompt = async () => {
    if (!caption || expanding) return;
    setExpanding(true);
    try {
      const expanded = await api.expandPrompt(caption);
      setExpandedPrompt(expanded);
    } catch (err) {
      console.error(err);
    } finally {
      setExpanding(false);
    }
  };

  const handleGenerateVariations = async () => {
    if (!caption || varying) return;
    setVarying(true);
    try {
      const vars = await api.getPromptVariations(caption);
      setVariations(vars);
    } catch (err) {
      console.error(err);
    } finally {
      setVarying(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10">
      
      {/* Header */}
      <div className="max-w-2xl mb-8">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-3">
          <Eye size={13} />
          <span>BLIP Vision-Language Model</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Image to Prompt Reverse AI</h1>
        <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
          Upload any picture to reverse-engineer its prompt description. Extract detailed composition, subject, and lighting nuances to recreate similar artwork in Studio.
        </p>
      </div>

      {/* Upload Zone / Workspace */}
      <div className="bg-zinc-900/20 border border-white/[0.06] rounded-xl p-6 sm:p-8 mb-12">
        {(state === "idle" || state === "error") && (
          <div
            className="w-full border-2 border-dashed border-white/[0.08] hover:border-purple-500/50 rounded-xl bg-zinc-950/40 p-12 text-center transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[320px]"
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
            <p className="text-zinc-500 text-xs">Drop any photo to analyze visual elements with AI</p>

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
              <div className="w-12 h-12 rounded-full border-2 border-zinc-800 border-t-purple-500 animate-spin" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium text-white">
                {state === "uploading" ? "Analyzing image..." : "Interpreting visual scene with BLIP AI..."}
              </p>
              <p className="text-xs text-zinc-500">Detecting subjects, colors, lighting, and composition style</p>
            </div>
          </div>
        )}

        {state === "done" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Image Preview (5 Cols) */}
              <div className="md:col-span-5 space-y-2">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-mono">Input Image</span>
                <div className="aspect-square rounded-lg overflow-hidden bg-zinc-950 border border-white/[0.08] flex items-center justify-center">
                  <img src={originalImage} alt="Input source" className="w-full h-full object-contain" />
                </div>
              </div>

              {/* Extracted Prompt Box (7 Cols) */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-5">
                
                {/* Base Caption */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-purple-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Sparkles size={13} />
                      <span>Extracted Prompt Description</span>
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">BLIP-large</span>
                  </div>

                  <div className="p-4 rounded-lg bg-zinc-950 border border-white/[0.08] text-sm text-zinc-200 leading-relaxed font-sans min-h-[100px] flex items-center">
                    "{caption}"
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={() => handleCopy(caption)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.08] text-zinc-300 text-xs font-medium transition-colors cursor-pointer border border-white/[0.06]"
                    >
                      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>

                    <button
                      onClick={handleExpandPrompt}
                      disabled={expanding}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-medium transition-colors cursor-pointer border border-blue-500/20 disabled:opacity-50"
                    >
                      <Sparkles size={13} className={expanding ? "animate-spin" : ""} />
                      <span>{expanding ? "Expanding..." : "AI Expand Prompt"}</span>
                    </button>

                    <button
                      onClick={handleGenerateVariations}
                      disabled={varying}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 text-xs font-medium transition-colors cursor-pointer border border-purple-500/20 disabled:opacity-50"
                    >
                      <Dices size={13} className={varying ? "animate-spin" : ""} />
                      <span>{varying ? "Generating..." : "Generate Variations"}</span>
                    </button>

                    <button
                      onClick={() => handleUsePrompt(caption)}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium transition-colors cursor-pointer shadow-sm ml-auto"
                    >
                      <Wand2 size={13} />
                      <span>Use in Studio</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>

                {/* AI Expanded Prompt Result */}
                {expandedPrompt && (
                  <div className="p-4 rounded-lg bg-blue-950/20 border border-blue-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-blue-400 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles size={12} />
                        <span>Art-Directed Prompt Expansion</span>
                      </span>
                      <button
                        onClick={() => handleUsePrompt(expandedPrompt)}
                        className="text-xs text-blue-400 hover:text-blue-300 font-medium cursor-pointer flex items-center gap-1"
                      >
                        <span>Load into Studio</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed italic">
                      "{expandedPrompt}"
                    </p>
                  </div>
                )}

                {/* AI Variations Results */}
                {variations && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                      Creative Stylistic Perspectives
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {variations.map((v, i) => (
                        <div
                          key={i}
                          onClick={() => handleUsePrompt(v.prompt)}
                          className="p-3 rounded-lg bg-zinc-950/60 border border-white/[0.06] hover:border-blue-500/40 hover:bg-zinc-900/60 transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-blue-400 group-hover:text-blue-300">{v.style}</span>
                            <span className="text-[11px] text-zinc-500 group-hover:text-zinc-300 flex items-center gap-1">
                              <span>Load</span>
                              <ArrowRight size={11} />
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {v.prompt}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>

            <div className="flex items-center justify-start border-t border-white/[0.06] pt-4">
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Upload another photo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-xl bg-zinc-900/20 border border-white/[0.05]">
          <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3">
            <Brain size={18} />
          </div>
          <h3 className="text-sm font-semibold text-white">Reverse Prompt Engineering</h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Deconstruct any visual into natural language tokens that diffusion models like FLUX.1 understand natively.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/20 border border-white/[0.05]">
          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
            <Wand2 size={18} />
          </div>
          <h3 className="text-sm font-semibold text-white">1-Click Studio Remix</h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Send the reverse-engineered prompt directly to Studio without copy-pasting to tweak and regenerate fresh variations.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-zinc-900/20 border border-white/[0.05]">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
            <Sparkles size={18} />
          </div>
          <h3 className="text-sm font-semibold text-white">Detailed Scene Understanding</h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Identifies foreground actors, background architecture, materials, mood, and weather atmosphere in seconds.
          </p>
        </div>
      </div>

    </div>
  );
};

export default ImageCaptioner;
