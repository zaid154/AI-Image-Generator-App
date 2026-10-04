import React, { useState, useRef } from 'react';
import { Upload, Download, X, RefreshCw, AlertCircle, Image as ImageIcon } from 'lucide-react';

const ImageUpscaler = () => {
  const [state, setState] = useState('idle'); // idle, uploading, processing, done, error
  const [originalImage, setOriginalImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [fileSize, setFileSize] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setState('error');
      setErrorMessage('Please select an image file.');
      return;
    }

    processFile(file);
  };

  const processFile = (file) => {
    setFileSize((file.size / (1024 * 1024)).toFixed(2));
    setState('uploading');
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const base64DataURL = e.target.result;
      setOriginalImage(base64DataURL);
      
      const base64String = base64DataURL.split(',')[1];
      
      setState('processing');
      try {
        const response = await fetch('http://localhost:5001/upscale-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64String }),
        });

        if (!response.ok) {
          throw new Error('Failed to upscale image');
        }

        const data = await response.text();
        setResultImage(`data:image/png;base64,${data}`);
        setState('done');
      } catch (error) {
        setState('error');
        setErrorMessage('Failed to upscale image. Please try again.');
        console.error(error);
      }
    };
    
    reader.onerror = () => {
      setState('error');
      setErrorMessage('Failed to read file.');
    };
    
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        processFile(file);
      } else {
        setState('error');
        setErrorMessage('Please drop an image file.');
      }
    }
  };

  const reset = () => {
    setState('idle');
    setOriginalImage(null);
    setResultImage(null);
    setErrorMessage('');
    setFileSize(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-medium text-zinc-100">Image Upscaler</h2>
        <p className="text-zinc-400">Enhance your images to higher resolution with AI.</p>
      </div>

      {(state === 'idle' || state === 'error') && (
        <div
          className="w-full border border-dashed border-white/[0.06] rounded-xl bg-zinc-900/30 p-12 text-center hover:bg-zinc-900/50 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[300px]"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
            <Upload className="w-5 h-5 text-zinc-400" />
          </div>
          <p className="text-zinc-300 font-medium mb-1">Click to upload or drag and drop</p>
          <p className="text-zinc-500 text-sm">SVG, PNG, JPG or GIF</p>
          
          {state === 'error' && (
            <div className="mt-6 flex items-center gap-2 text-red-400 bg-red-400/10 px-4 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {(state === 'uploading' || state === 'processing') && (
        <div className="w-full border border-white/[0.06] rounded-xl bg-zinc-900/30 p-12 flex flex-col items-center justify-center min-h-[300px]">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mb-4" />
          <p className="text-zinc-300 font-medium">
            {state === 'uploading' ? 'Reading image...' : 'Upscaling image...'}
          </p>
          <p className="text-zinc-500 text-sm mt-1">This might take a few seconds</p>
        </div>
      )}

      {state === 'done' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-zinc-400 text-sm">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Original Image</span>
                </div>
                {fileSize && <span>{fileSize} MB</span>}
              </div>
              <div className="border border-white/[0.06] rounded-xl bg-zinc-900/30 overflow-hidden aspect-square flex items-center justify-center p-2">
                {originalImage && (
                  <img src={originalImage} alt="Original" className="max-w-full max-h-full object-contain" />
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-zinc-400 text-sm">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Upscaled Result</span>
                </div>
              </div>
              <div className="border border-white/[0.06] rounded-xl bg-zinc-900/30 overflow-hidden aspect-square flex items-center justify-center p-2">
                {resultImage && (
                  <img src={resultImage} alt="Upscaled" className="max-w-full max-h-full object-contain" />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/[0.06] pt-6">
            <button
              onClick={reset}
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors text-sm px-4 py-2"
            >
              <X className="w-4 h-4" />
              Try another image
            </button>
            <a
              href={resultImage}
              download="upscaled-image.png"
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Download Result
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpscaler;
