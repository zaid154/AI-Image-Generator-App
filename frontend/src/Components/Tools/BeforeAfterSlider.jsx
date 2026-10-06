import React, { useState, useRef, useEffect, useCallback } from "react";

const BeforeAfterSlider = ({ beforeImage, afterImage, beforeLabel = "Original", afterLabel = "Enhanced" }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(position);
  }, []);

  const handleTouchMove = (e) => {
    if (isDragging && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  useEffect(() => {
    const stopDragging = () => setIsDragging(false);
    window.addEventListener("mouseup", stopDragging);
    window.addEventListener("touchend", stopDragging);
    return () => {
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("touchend", stopDragging);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseDown={() => setIsDragging(true)}
      onTouchStart={() => setIsDragging(true)}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative w-full h-full select-none overflow-hidden cursor-ew-resize rounded-lg bg-zinc-950 flex items-center justify-center"
    >
      {/* Background (After / Enhanced Image) */}
      <img
        src={afterImage}
        alt={afterLabel}
        className="absolute inset-0 w-full h-full object-contain pointer-events-none"
      />

      {/* Foreground (Before / Original Image with clip path) */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
        style={{
          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`,
        }}
      >
        <img
          src={beforeImage}
          alt={beforeLabel}
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>

      {/* Vertical Divider Line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)] pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Handle Grip Circle */}
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-black/80 backdrop-blur-md border border-white/60 flex items-center justify-center shadow-xl">
          <div className="flex items-center gap-1">
            <span className="w-1 h-3 bg-white/70 rounded-full" />
            <span className="w-1 h-3 bg-white/70 rounded-full" />
          </div>
        </div>
      </div>

      {/* Floating Badges */}
      <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-zinc-300 pointer-events-none border border-white/[0.08]">
        {beforeLabel}
      </div>
      <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-blue-600/80 backdrop-blur-md text-[10px] font-mono text-white pointer-events-none border border-blue-400/30">
        {afterLabel}
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
