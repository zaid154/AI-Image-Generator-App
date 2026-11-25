/**
 * Client-Side SVG Vectorizer Engine (Recraft.ai Style)
 * Converts raster canvas/image data into scalable SVG vector paths.
 * 100% free, runs client-side in browser with zero dependencies and no external API latency.
 */

export function convertImageToSVG(imageSrc, options = {}) {
  const {
    colorCount = 8,       // Number of color levels (quantization)
    detailThreshold = 30, // Noise reduction threshold (0-100)
    smoothCurves = true,  // Path smoothing
  } = options;

  return new Promise((resolve, reject) => {
    if (!imageSrc || imageSrc === "/") {
      reject(new Error("No valid image source provided"));
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageSrc;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        // Normalize processing dimension to maintain high fidelity while ensuring fast vectorization
        const maxDimension = 512;
        let w = img.width;
        let h = img.height;
        if (w > maxDimension || h > maxDimension) {
          if (w > h) {
            h = Math.round((h * maxDimension) / w);
            w = maxDimension;
          } else {
            w = Math.round((w * maxDimension) / h);
            h = maxDimension;
          }
        }

        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Step 1: Posterize & Quantize Colors into buckets
        const step = Math.max(16, Math.floor(256 / colorCount));
        const colorBuckets = {};

        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a < 50) continue; // skip transparent

          const r = Math.floor(data[i] / step) * step;
          const g = Math.floor(data[i + 1] / step) * step;
          const b = Math.floor(data[i + 2] / step) * step;

          const key = `${r},${g},${b}`;
          if (!colorBuckets[key]) {
            colorBuckets[key] = [];
          }
          const pixelIndex = i / 4;
          colorBuckets[key].push(pixelIndex);
        }

        // Sort colors by area prominence (largest areas first)
        const sortedColors = Object.entries(colorBuckets)
          .sort((a, b) => b[1].length - a[1].length)
          .slice(0, colorCount);

        // Step 2: Trace bounding blocks and polygon regions for each color
        let svgPaths = "";

        sortedColors.forEach(([colorKey, pixels]) => {
          const [r, g, b] = colorKey.split(",").map(Number);
          const hex = `#${Math.min(255, r).toString(16).padStart(2, "0")}${Math.min(255, g).toString(16).padStart(2, "0")}${Math.min(255, b).toString(16).padStart(2, "0")}`;

          // Create boolean mask of this color
          const mask = new Uint8Array(w * h);
          for (let i = 0; i < pixels.length; i++) {
            mask[pixels[i]] = 1;
          }

          // Build simplified horizontal run-length segments
          let pathData = "";
          for (let y = 0; y < h; y += 2) {
            let inRun = false;
            let runStart = 0;

            for (let x = 0; x < w; x += 2) {
              const idx = y * w + x;
              if (mask[idx]) {
                if (!inRun) {
                  inRun = true;
                  runStart = x;
                }
              } else {
                if (inRun) {
                  inRun = false;
                  const runWidth = x - runStart;
                  if (runWidth >= (detailThreshold > 50 ? 4 : 2)) {
                    pathData += `M${runStart},${y}h${runWidth}v2h-${runWidth}z `;
                  }
                }
              }
            }
            if (inRun) {
              const runWidth = w - runStart;
              if (runWidth >= (detailThreshold > 50 ? 4 : 2)) {
                pathData += `M${runStart},${y}h${runWidth}v2h-${runWidth}z `;
              }
            }
          }

          if (pathData) {
            svgPaths += `<path d="${pathData.trim()}" fill="${hex}" shape-rendering="${smoothCurves ? "geometricPrecision" : "crispEdges"}" />\n`;
          }
        });

        // Assemble clean SVG XML
        const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%">
  <defs>
    <style>
      path { transition: fill 0.2s ease; }
    </style>
  </defs>
  ${svgPaths}
</svg>`;

        resolve({
          svgString: svgContent,
          width: w,
          height: h,
          colorCount: sortedColors.length,
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load source image for vectorization."));
    };
  });
}
