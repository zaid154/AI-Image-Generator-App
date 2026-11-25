import React from "react";

const Footer = ({ onOpenLegal }) => {
  return (
    <footer className="border-t border-white/[0.06] bg-transparent mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
        <div className="text-zinc-400 flex items-center gap-2">
          <span className="font-semibold text-white">VividAI</span>
          <span className="text-zinc-600">·</span>
          <span>Open-Weights Image Studio</span>
          <span className="text-zinc-600">·</span>
          <span className="font-mono text-zinc-400">FLUX.1-schnell</span>
        </div>
        
        <div className="flex items-center gap-5">
          <button
            onClick={() => onOpenLegal("privacy")}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => onOpenLegal("terms")}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Terms of Service
          </button>
          <button
            onClick={() => onOpenLegal("api")}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            AI Disclosures
          </button>
          <button
            onClick={() => onOpenLegal("cookies")}
            className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            Data &amp; Cookies
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
