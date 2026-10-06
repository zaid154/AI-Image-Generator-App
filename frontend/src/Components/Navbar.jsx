import React from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const navItems = [
    { path: "/", label: "Studio" },
    { path: "/bg-remover", label: "BG Remover" },
    { path: "/upscaler", label: "Upscaler" },
    { path: "/captioner", label: "Image to Prompt" },
    { path: "/gallery", label: "Gallery" },
    { path: "/guide", label: "Prompt Guide" },
    { path: "/pricing", label: "Pricing" },
    { path: "/faq", label: "FAQ" },
  ];

  const handleCreateClick = () => {
    navigate("/");
    setTimeout(() => {
      const textarea = document.querySelector("textarea");
      if (textarea) {
        textarea.focus();
      }
    }, 100);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand Logo */}
          <Link 
            to="/"
            className="flex items-center gap-2 cursor-pointer select-none text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded"
          >
            <span className="font-semibold text-base text-white tracking-tight">
              VividAI
            </span>
            <span className="text-[10px] font-mono uppercase text-zinc-400 px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] hidden sm:inline-block">
              Studio
            </span>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-6 h-full">
            {navItems.map((item) => (
              <React.Fragment key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === "/"}
                  className={({ isActive }) =>
                    `text-sm font-medium transition-colors cursor-pointer relative h-full flex items-center px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                      isActive
                        ? "text-white"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-500 rounded-full" />
                      )}
                    </>
                  )}
                </NavLink>

                {/* Visual Separator between AI Tools & Info pages */}
                {item.path === "/captioner" && (
                  <div className="w-px h-4 bg-white/[0.08] mx-1 self-center" />
                )}
              </React.Fragment>
            ))}
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
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `text-xs font-medium whitespace-nowrap transition-colors py-1 px-1.5 rounded ${
                  isActive ? "text-white bg-white/[0.08]" : "text-zinc-400 hover:text-zinc-200"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
