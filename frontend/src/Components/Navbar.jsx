import React from "react";

const Navbar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'generator', label: 'Studio' },
    { id: 'bg-remover', label: 'BG Remover' },
    { id: 'upscaler', label: 'Upscaler' },
    { id: 'captioner', label: 'Image to Prompt' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'guide', label: 'Prompt Guide' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'faq', label: 'FAQ' },
  ];

  const handleCreateClick = () => {
    setActiveTab("generator");
    // If already on generator, smoothly scroll or focus textarea
    const textarea = document.querySelector("textarea");
    if (textarea) {
      textarea.focus();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand Logo */}
          <button 
            type="button"
            onClick={() => setActiveTab("generator")}
            className="flex items-center gap-2 cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            <span className="font-semibold text-base text-white tracking-tight">
              VividAI
            </span>
            <span className="text-[10px] font-mono uppercase text-zinc-400 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] hidden sm:inline-block">
              Studio
            </span>
          </button>

          {/* Navigation Links (Desktop) */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-6 h-full">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <React.Fragment key={item.id}>
                  <button
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={`text-sm font-medium transition-colors cursor-pointer relative h-full flex items-center px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isActive
                        ? "text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 rounded-full" />
                    )}
                  </button>
                  {item.id === 'captioner' && (
                    <div className="w-px h-4 bg-white/[0.08] mx-1" />
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Right Action / Engine Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs" title="Connected to FLUX.1 serverless inference">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-zinc-400 text-[11px]">FLUX.1-schnell</span>
            </div>

            <button
              type="button"
              onClick={handleCreateClick}
              className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer hidden sm:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              New Generation
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <nav aria-label="Mobile Navigation" className="flex md:hidden items-center justify-between py-2.5 border-t border-white/[0.06] overflow-x-auto gap-4 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`text-xs font-medium whitespace-nowrap transition-colors py-1 px-1.5 rounded ${
                  isActive ? "text-white bg-white/[0.08]" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
