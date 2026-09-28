import React from 'react';

const Footer = ({ setActiveTab }) => {
  return (
    <footer className="border-t border-white/[0.06] bg-transparent">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm font-medium text-zinc-500">
          VividAI <span className="text-zinc-600 font-normal">· Built with FLUX.1</span>
        </div>
        
        <div className="flex items-center gap-6">
          <a href="#" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            Privacy
          </a>
          <a href="#" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            Terms
          </a>
          <a href="#" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
            API
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
