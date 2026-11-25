import React, { useState } from "react";
import { X, ShieldCheck, FileText, Cpu, Cookie } from "lucide-react";

const LegalModal = ({ isOpen, onClose, initialTab = "privacy" }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div className="bg-[#0f1117] border border-white/[0.08] rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white" id="legal-dialog-title">
              Legal, Compliance & Disclosures
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="text-zinc-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-white/[0.06] overflow-x-auto">
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === "privacy"
                ? "border-blue-500 text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ShieldCheck size={14} />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => setActiveTab("terms")}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === "terms"
                ? "border-blue-500 text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <FileText size={14} />
            <span>Terms of Service</span>
          </button>
          <button
            onClick={() => setActiveTab("api")}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === "api"
                ? "border-blue-500 text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Cpu size={14} />
            <span>AI Disclosures</span>
          </button>
          <button
            onClick={() => setActiveTab("cookies")}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === "cookies"
                ? "border-blue-500 text-white"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Cookie size={14} />
            <span>Data & Storage</span>
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto text-xs text-zinc-300 space-y-4 leading-relaxed">
          {activeTab === "privacy" && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-white">Privacy Policy</h2>
              <p className="text-zinc-400">
                Last updated: September 2026. VividAI values your privacy. We are committed to transparency regarding how data is processed when you use our creative studio.
              </p>
              
              <div className="space-y-2">
                <h3 className="text-xs font-medium text-white uppercase tracking-wider">1. Data We Process</h3>
                <p className="text-zinc-400">
                  When you submit a text prompt, it is transmitted securely via HTTPS to our backend server and forwarded ephemerally to our AI inference provider (Hugging Face Serverless Inference API). We do not record your IP address or associate prompts with any personally identifiable information.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-medium text-white uppercase tracking-wider">2. Image Storage</h3>
                <p className="text-zinc-400">
                  Generated images are converted to base64 format in memory and delivered directly to your client browser. We do not maintain a permanent database of your generated images on our server. If you refresh your browser or clear session storage, temporary images are cleared.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-medium text-white uppercase tracking-wider">3. Third-Party Processors</h3>
                <p className="text-zinc-400">
                  Prompt auto-correction is handled by Qwen 2.5-72B-Instruct, and diffusion generation is performed by Black Forest Labs' FLUX.1-schnell model hosted on Hugging Face infrastructure. Your inputs are governed by their respective API usage terms.
                </p>
              </div>
            </div>
          )}

          {activeTab === "terms" && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-white">Terms of Service</h2>
              <p className="text-zinc-400">
                By accessing VividAI, you agree to these terms and acknowledge our content guidelines.
              </p>

              <div className="space-y-2">
                <h3 className="text-xs font-medium text-white uppercase tracking-wider">1. Output Ownership & Commercial Rights</h3>
                <p className="text-zinc-400">
                  Images generated with the open-weights FLUX.1-schnell model are subject to the Apache 2.0 license. To the maximum extent permitted by applicable law, you retain full rights to the images you generate, including royalty-free personal and commercial usage rights.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-medium text-white uppercase tracking-wider">2. Acceptable Use</h3>
                <p className="text-zinc-400">
                  You agree not to use the service to generate hate speech, harassment, non-consensual imagery, deceptive or defamatory content, or material that infringes third-party intellectual property or violates applicable safety guidelines.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-medium text-white uppercase tracking-wider">3. Service Availability</h3>
                <p className="text-zinc-400">
                  The service relies on cloud GPU infrastructure provided through serverless endpoints. While we strive for high uptime, generation speed may fluctuate during peak global inference hours. The service is provided on an "as-is" basis without express warranties.
                </p>
              </div>
            </div>
          )}

          {activeTab === "api" && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-white">AI Engine & Model Disclosures</h2>
              <p className="text-zinc-400">
                Technical architecture details for complete engineering transparency:
              </p>

              <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-lg space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Primary Diffusion Model</span>
                  <span className="font-mono text-white">black-forest-labs/FLUX.1-schnell</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Architecture</span>
                  <span className="font-mono text-white">12B Parameter Flow Transformer</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Prompt Optimizer</span>
                  <span className="font-mono text-white">Qwen/Qwen2.5-72B-Instruct</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Inference Cloud</span>
                  <span className="font-mono text-white">Hugging Face Inference Endpoints</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400">Output Resolution</span>
                  <span className="font-mono text-white">1024 × 1024 (PNG format)</span>
                </div>
              </div>

              <p className="text-zinc-400 text-xs">
                FLUX.1-schnell is optimized for 4-step rapid inference, generating high-fidelity photorealistic anatomy, natural lighting, and sharp compositional geometry without complex negative prompt overhead.
              </p>
            </div>
          )}

          {activeTab === "cookies" && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold text-white">Cookies & Local Storage Policy</h2>
              <p className="text-zinc-400">
                We respect your digital footprint and do not deploy intrusive tracking mechanisms.
              </p>

              <div className="space-y-2">
                <h3 className="text-xs font-medium text-white uppercase tracking-wider">No Advertising or Analytics Trackers</h3>
                <p className="text-zinc-400">
                  VividAI does NOT use third-party advertising cookies, cross-site trackers, or behavioral profiling scripts.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-medium text-white uppercase tracking-wider">Client-Side Session State</h3>
                <p className="text-zinc-400">
                  We use client-side React state and browser memory solely for:
                </p>
                <ul className="list-disc pl-5 text-zinc-400 space-y-1">
                  <li>Retaining your recently generated thumbnails during an active studio session</li>
                  <li>Maintaining your selected style preset and active navigation tab</li>
                  <li>Remembering prompts selected from the Gallery or Prompt Guide</li>
                </ul>
                <p className="text-zinc-400 mt-2">
                  This data stays strictly on your personal device and is never uploaded or sold.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-white/[0.06] bg-black/30">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md text-xs font-medium bg-white/[0.08] hover:bg-white/[0.12] text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalModal;
