import React, { useState } from "react";
import { 
  X, Copy, Check, GitFork, Sparkles, Download, 
  Layers, Lock, Compass, Calendar, Clock 
} from "lucide-react";

const MetadataInspectorModal = ({ isOpen, onClose, item, onForkSettings }) => {
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  if (!isOpen || !item) return null;

  const handleCopySeed = () => {
    navigator.clipboard.writeText(String(item.seed || ""));
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 2000);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(item.enhanced || item.prompt || "");
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleFork = () => {
    if (onForkSettings) {
      onForkSettings(item);
    }
    onClose();
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = item.url;
    a.download = `vivid-ai-${item.seed || Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-[#0c0c12] border border-white/[0.08] rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Compass size={16} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Generation Metadata &amp; Inspector</h2>
              <p className="text-xs text-zinc-400">Deep technical inspection and parameter reproducibility (Midjourney style)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Left: Artwork Preview (5 Cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="aspect-square rounded-xl overflow-hidden bg-zinc-950 border border-white/[0.08] shadow-lg flex items-center justify-center">
              <img src={item.url} alt="Generation preview" className="w-full h-full object-cover" />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-medium text-white transition-colors cursor-pointer"
              >
                <Download size={13} />
                <span>Download File</span>
              </button>
            </div>
          </div>

          {/* Right: Technical Metadata (7 Cols) */}
          <div className="md:col-span-7 space-y-4">
            
            {/* Prompt Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                  Prompt Text:
                </span>
                <button
                  onClick={handleCopyPrompt}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                >
                  {copiedPrompt ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedPrompt ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-3 rounded-lg bg-zinc-950 border border-white/[0.06] text-xs text-zinc-200 leading-relaxed font-sans">
                "{item.prompt}"
              </div>
            </div>

            {/* Enhanced Prompt Box (if present) */}
            {item.enhanced && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-purple-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>AI Art-Directed Refinement:</span>
                </span>
                <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/30 text-xs text-zinc-300 italic leading-relaxed">
                  "{item.enhanced}"
                </div>
              </div>
            )}

            {/* Technical Parameter Badges Grid */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              
              <div className="p-2.5 rounded-lg bg-zinc-950 border border-white/[0.05]">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Engine Model</span>
                <span className="text-xs font-semibold text-white">{item.model || "flux-schnell"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-950 border border-white/[0.05]">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Aspect Ratio</span>
                <span className="text-xs font-semibold text-white">{item.aspectRatio || "1:1"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-950 border border-white/[0.05] flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Reproducibility Seed</span>
                  <span className="text-xs font-mono font-semibold text-amber-300">{item.seed || "Random"}</span>
                </div>
                {item.seed && (
                  <button
                    onClick={handleCopySeed}
                    className="text-zinc-500 hover:text-white p-1 cursor-pointer"
                    title="Copy seed"
                  >
                    {copiedSeed ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  </button>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-zinc-950 border border-white/[0.05]">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block">Project Folder</span>
                <span className="text-xs font-medium text-blue-400">{item.collection || "All"}</span>
              </div>

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-white/[0.06] bg-zinc-950/90 flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            Recorded at {item.timestamp || "Recent session"}
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={handleFork}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-medium transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <GitFork size={14} />
              <span>Fork &amp; Clone Settings to Studio</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default MetadataInspectorModal;
