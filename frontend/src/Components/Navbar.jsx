import React from "react";

const Navbar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: "generator", label: "Studio" },
    { id: "gallery", label: "Explore Gallery" },
    { id: "guide", label: "Prompt Guide" },
    { id: "pricing", label: "Pricing" },
    { id: "faq", label: "FAQ" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-sm border-b border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand Logo */}
          <div 
            onClick={() => setActiveTab("generator")}
            className="flex items-center cursor-pointer select-none"
          >
            <span className="font-semibold text-base text-white">
              VividAI
            </span>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 h-full">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`text-sm font-medium transition-all cursor-pointer relative h-full flex items-center ${
                    isActive
                      ? "text-white opacity-100"
                      : "text-white opacity-60 hover:opacity-100"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action / Engine Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span className="font-mono text-zinc-400">FLUX.1</span>
            </div>

            <button
              onClick={() => setActiveTab("generator")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer hidden sm:block"
            >
              Create
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-between py-3 border-t border-white/[0.06] overflow-x-auto gap-4">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive ? "text-white opacity-100" : "text-white opacity-60"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
