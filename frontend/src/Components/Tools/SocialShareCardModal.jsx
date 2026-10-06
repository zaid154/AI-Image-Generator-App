import React, { useState, useRef, useEffect } from "react";
import { X, Download, Share2, Sparkles, Image as ImageIcon, Sliders, Check } from "lucide-react";

const SocialShareCardModal = ({ isOpen, onClose, imageUrl, promptText = "", modelName = "FLUX.1 Schnell", seed = "", aspectRatio = "1:1" }) => {
  const canvasRef = useRef(null);
  const [cardFormat, setCardFormat] = useState("landscape"); // landscape (16:9), portrait (4:5), square (1:1)
  const [showPrompt, setShowPrompt] = useState(true);
  const [showSpecs, setShowSpecs] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Render canvas preview whenever controls or image change
  useEffect(() => {
    if (!isOpen || !imageUrl) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Dimensions based on format
    let width = 1200;
    let height = 675;
    if (cardFormat === "portrait") {
      width = 1080;
      height = 1350;
    } else if (cardFormat === "square") {
      width = 1080;
      height = 1080;
    }

    canvas.width = width;
    canvas.height = height;

    // Load source artwork
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      // 1. Background fill (Rich dark slate with subtle radial gradient)
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, Math.max(width, height));
      bgGrad.addColorStop(0, "#12121a");
      bgGrad.addColorStop(1, "#07070a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Subtle outer border glow
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 2;
      ctx.strokeRect(20, 20, width - 40, height - 40);

      // 3. Draw Layout based on format
      if (cardFormat === "landscape") {
        // Landscape: Left 65% image, Right 35% text panel
        const pad = 40;
        const imgW = width * 0.58;
        const imgH = height - pad * 2;
        const imgX = pad;
        const imgY = pad;

        // Draw image with rounded clipping
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgW, imgH, 20);
        ctx.clip();
        
        // Draw image cover-fit
        const hRatio = imgW / img.width;
        const vRatio = imgH / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShiftX = (imgW - img.width * ratio) / 2;
        const centerShiftY = (imgH - img.height * ratio) / 2;
        ctx.drawImage(img, 0, 0, img.width, img.height, imgX + centerShiftX, imgY + centerShiftY, img.width * ratio, img.height * ratio);
        ctx.restore();

        // Right side info panel
        const textX = imgX + imgW + 36;
        let textY = pad + 40;

        // Brand logo
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 26px sans-serif";
        ctx.fillText("VividAI Studio", textX, textY);
        
        ctx.fillStyle = "#3b82f6";
        ctx.font = "bold 13px monospace";
        ctx.fillText("AI CREATIVE SUITE", textX, textY + 22);

        textY += 75;

        // Prompt text
        if (showPrompt && promptText) {
          ctx.fillStyle = "#a1a1aa";
          ctx.font = "bold 12px monospace";
          ctx.fillText("PROMPT", textX, textY);
          textY += 20;

          ctx.fillStyle = "#f4f4f5";
          ctx.font = "italic 16px sans-serif";
          textY = wrapText(ctx, `"${promptText}"`, textX, textY, width - textX - pad, 24, 7);
          textY += 30;
        }

        // Specs badges
        if (showSpecs) {
          drawBadge(ctx, textX, textY, "MODEL", modelName);
          textY += 45;
          drawBadge(ctx, textX, textY, "ASPECT", aspectRatio);
          if (seed) {
            textY += 45;
            drawBadge(ctx, textX, textY, "SEED", String(seed));
          }
        }

        // Footer watermark
        ctx.fillStyle = "#52525b";
        ctx.font = "12px monospace";
        ctx.fillText("Generated with black-forest-labs/FLUX.1", textX, height - pad - 10);

      } else {
        // Portrait or Square: Top Image, Bottom Info Panel
        const pad = 36;
        const imgH = cardFormat === "portrait" ? height * 0.65 : height * 0.62;
        const imgW = width - pad * 2;
        const imgX = pad;
        const imgY = pad;

        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgW, imgH, 20);
        ctx.clip();

        const hRatio = imgW / img.width;
        const vRatio = imgH / img.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShiftX = (imgW - img.width * ratio) / 2;
        const centerShiftY = (imgH - img.height * ratio) / 2;
        ctx.drawImage(img, 0, 0, img.width, img.height, imgX + centerShiftX, imgY + centerShiftY, img.width * ratio, img.height * ratio);
        ctx.restore();

        // Bottom panel
        let textY = imgY + imgH + 34;

        // Header line
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 24px sans-serif";
        ctx.fillText("VividAI Studio", pad, textY);

        ctx.fillStyle = "#3b82f6";
        ctx.font = "bold 12px monospace";
        ctx.fillText(modelName.toUpperCase(), width - pad - ctx.measureText(modelName.toUpperCase()).width, textY);

        textY += 30;

        if (showPrompt && promptText) {
          ctx.fillStyle = "#e4e4e7";
          ctx.font = "italic 16px sans-serif";
          textY = wrapText(ctx, `"${promptText}"`, pad, textY, width - pad * 2, 24, 4);
          textY += 20;
        }

        if (showSpecs) {
          const badges = [`MODEL: ${modelName}`, `RATIO: ${aspectRatio}`, seed ? `SEED: ${seed}` : null].filter(Boolean);
          let badgeX = pad;
          badges.forEach((b) => {
            const bWidth = ctx.measureText(b).width + 24;
            ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
            ctx.beginPath();
            ctx.roundRect(badgeX, textY, bWidth, 26, 6);
            ctx.fill();

            ctx.fillStyle = "#94a3b8";
            ctx.font = "11px monospace";
            ctx.fillText(b, badgeX + 12, textY + 17);
            badgeX += bWidth + 10;
          });
        }
      }
    };
  }, [isOpen, imageUrl, cardFormat, showPrompt, showSpecs, promptText, modelName, seed, aspectRatio]);

  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 5) {
    const words = text.split(" ");
    let line = "";
    let linesDrawn = 0;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + " ";
        y += lineHeight;
        linesDrawn++;
        if (linesDrawn >= maxLines - 1) {
          line += "...";
          break;
        }
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
    return y;
  }

  function drawBadge(ctx, x, y, label, val) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, 220, 34, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#71717a";
    ctx.font = "bold 10px monospace";
    ctx.fillText(label, x + 12, y + 21);

    ctx.fillStyle = "#f4f4f5";
    ctx.font = "12px monospace";
    ctx.fillText(val, x + 68, y + 21);
  }

  const handleDownloadCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    setTimeout(() => {
      const dataUrl = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `vivid-showcase-${cardFormat}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    }, 150);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-[#0c0c12] border border-white/[0.08] rounded-2xl flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Share2 size={16} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Social Showcase Card Studio</h2>
              <p className="text-xs text-zinc-400">Generate high-res cards formatted for Twitter, Instagram, or portfolios</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-3 border-b border-white/[0.04] bg-zinc-950/40">
          
          {/* Format Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium">Layout:</span>
            <div className="inline-flex rounded-lg border border-white/[0.08] bg-black/40 p-0.5">
              <button
                onClick={() => setCardFormat("landscape")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  cardFormat === "landscape" ? "bg-white/[0.1] text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Landscape (16:9)
              </button>
              <button
                onClick={() => setCardFormat("portrait")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  cardFormat === "portrait" ? "bg-white/[0.1] text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Portrait (4:5)
              </button>
              <button
                onClick={() => setCardFormat("square")}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  cardFormat === "square" ? "bg-white/[0.1] text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                Square (1:1)
              </button>
            </div>
          </div>

          {/* Display Toggles */}
          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                checked={showPrompt}
                onChange={(e) => setShowPrompt(e.target.checked)}
                className="rounded border-zinc-700 text-blue-500 focus:ring-0"
              />
              <span>Include Prompt</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
              <input
                type="checkbox"
                checked={showSpecs}
                onChange={(e) => setShowSpecs(e.target.checked)}
                className="rounded border-zinc-700 text-blue-500 focus:ring-0"
              />
              <span>Include Technical Specs</span>
            </label>
          </div>
        </div>

        {/* Live Canvas Preview Stage */}
        <div className="flex-1 overflow-auto p-6 flex items-center justify-center bg-zinc-950/80 min-h-[360px]">
          <div className="max-w-full max-h-[500px] rounded-xl overflow-hidden border border-white/[0.08] shadow-2xl flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[480px] w-auto h-auto object-contain block"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-white/[0.06] bg-zinc-950/90 flex items-center justify-between">
          <p className="text-xs text-zinc-500 font-mono">
            Output: High-res uncompressed PNG graphic ready for social sharing
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={handleDownloadCard}
              disabled={downloading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-xs font-medium transition-all shadow-md shadow-blue-500/20 cursor-pointer disabled:opacity-50"
            >
              {downloadSuccess ? (
                <>
                  <Check size={14} className="text-white" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Download Showcase Card</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SocialShareCardModal;
