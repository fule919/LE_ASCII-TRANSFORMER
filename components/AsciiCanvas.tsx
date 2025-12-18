import React, { useEffect, useRef } from 'react';
import { AsciiSettings } from '../types';

interface AsciiCanvasProps {
  imageSrc: string | null;
  settings: AsciiSettings;
}

const CHAR_SETS = {
  halftone: ' .·:+*?%S#@', 
  // Optimized for depth perception
  detail: ' `.-' + "':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@",
  ascii: ' .`^",:;Il!i~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$',
  binary: ' 01',
  blocks: ' ░▒▓█', 
};

export const AsciiCanvas: React.FC<AsciiCanvasProps> = ({ imageSrc, settings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!imageSrc || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imageSrc;

    img.onload = () => {
      processImage(img, canvas, ctx, settings);
    };

  }, [imageSrc, settings]);

  const processImage = (
    img: HTMLImageElement,
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    settings: AsciiSettings
  ) => {
    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    // Finer resolution calculation
    // Max resolution (1.0) -> 5px font (highly detailed)
    // Min resolution (0.1) -> 20px font
    const minFont = 5;
    const maxFont = 20;
    const fontSize = Math.max(minFont, Math.floor(maxFont - (settings.resolution * (maxFont - minFont))));
    
    // Adjust aspect ratio for characters (fonts are usually taller than wide)
    // 0.55 often works better for monospace dense text than 0.6
    const fontWidth = fontSize * 0.55;
    const fontHeight = fontSize;

    const ratio = img.height / img.width;
    
    // Dynamic columns based on requested resolution vs image width
    const cols = Math.floor(img.width / (fontWidth / settings.resolution)); 
    // Constrain cols to reasonable limits to prevent crashing
    const safeCols = Math.min(Math.max(cols, 40), 600);
    
    const rows = Math.floor(safeCols * ratio * (fontWidth / fontHeight));

    offCanvas.width = safeCols;
    offCanvas.height = rows;

    offCtx.drawImage(img, 0, 0, safeCols, rows);
    const imageData = offCtx.getImageData(0, 0, safeCols, rows);
    const data = imageData.data;

    // Prepare main canvas
    canvas.width = safeCols * fontWidth;
    canvas.height = rows * fontHeight;

    // Fill background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Setup Font
    ctx.font = `${fontSize}px 'Space Mono', monospace`;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    const chars = CHAR_SETS[settings.charSetMode];
    const contrastFactor = (259 * (settings.contrast * 255 + 255)) / (255 * (259 - settings.contrast * 255));
    const charsLen = chars.length;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < safeCols; x++) {
        const offset = (y * safeCols + x) * 4;
        const r = data[offset];
        const g = data[offset + 1];
        const b = data[offset + 2];

        // Luma coefficients
        let gray = 0.299 * r + 0.587 * g + 0.114 * b;
        
        // Brightness
        gray += settings.brightness;
        
        // Contrast
        gray = contrastFactor * (gray - 128) + 128;
        
        // Clamp
        gray = Math.max(0, Math.min(255, gray));

        if (settings.invert) {
            gray = 255 - gray;
        }

        const charIndex = Math.floor((gray / 255) * (charsLen - 1));
        const char = chars[charIndex];

        if (char && char !== ' ') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(char, x * fontWidth, y * fontHeight);
        }
      }
    }
  };

  if (!imageSrc) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 space-y-4 min-h-[400px]">
        <div className="w-16 h-16 rounded-full border border-zinc-800 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
        </div>
        <p className="text-xs uppercase tracking-widest font-medium opacity-50">Upload an image to start</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden flex items-center justify-center bg-black/50">
      <div className="max-w-full max-h-full overflow-auto custom-scrollbar">
         <canvas ref={canvasRef} className="shadow-2xl shadow-black rounded-lg mx-auto" />
      </div>
    </div>
  );
};