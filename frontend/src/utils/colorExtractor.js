/**
 * Extracts dominant colors from an image using HTML5 Canvas pixel quantization
 * Runs 100% in the client browser with zero latency and no external dependencies.
 */

function rgbToHex(r, g, b) {
  const toHex = (n) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function getBrightness(r, g, b) {
  return (r * 299 + g * 587 + b * 114) / 1000;
}

export function extractDominantColors(imageSrc, colorCount = 5) {
  return new Promise((resolve) => {
    if (!imageSrc || imageSrc === "/") {
      resolve([]);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        
        // Scale down to 48x48 for ultra-fast sampling
        const sampleSize = 48;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

        const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
        const colorBuckets = {};

        // Quantize colors (group by 32 step bins to cluster similar shades)
        const step = 32;
        for (let i = 0; i < imgData.length; i += 16) { // sample every 4th pixel
          const a = imgData[i + 3];
          if (a < 128) continue; // skip transparent pixels

          const r = Math.floor(imgData[i] / step) * step;
          const g = Math.floor(imgData[i + 1] / step) * step;
          const b = Math.floor(imgData[i + 2] / step) * step;

          // Filter out near-pure blacks and pure whites from being dominant accents
          const brightness = getBrightness(r, g, b);
          if (brightness < 15 || brightness > 245) continue;

          const key = `${r},${g},${b}`;
          colorBuckets[key] = (colorBuckets[key] || 0) + 1;
        }

        // Sort clusters by frequency
        const sorted = Object.entries(colorBuckets)
          .sort((a, b) => b[1] - a[1])
          .slice(0, colorCount)
          .map(([key]) => {
            const [r, g, b] = key.split(",").map(Number);
            const hex = rgbToHex(r + step / 2, g + step / 2, b + step / 2);
            return {
              hex,
              rgb: `rgb(${r}, ${g}, ${b})`,
              isDark: getBrightness(r, g, b) < 128,
            };
          });

        if (sorted.length < colorCount) {
          // Fallback palette if image is nearly monochrome
          const fallbacks = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#06b6d4"];
          while (sorted.length < colorCount) {
            sorted.push({
              hex: fallbacks[sorted.length % fallbacks.length],
              rgb: "rgb(59, 130, 246)",
              isDark: true,
            });
          }
        }

        resolve(sorted);
      } catch (err) {
        console.warn("Color extraction canvas error:", err);
        resolve([]);
      }
    };

    img.onerror = () => {
      resolve([]);
    };
  });
}
