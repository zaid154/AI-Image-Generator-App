import React, { useState, useRef } from 'react';
import { Upload, X, RefreshCw, AlertCircle, Image as ImageIcon, Copy, Wand2, Check } from 'lucide-react';

const ImageCaptioner = ({ onSelectPrompt, setActiveTab }) => {
  const [state, setState] = useState('idle'); // idle, uploading, processing, done, error
  const [originalImage, setOriginalImage] = useState(null);
  const [caption, setCaption] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);
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
    setState('uploading');
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const base64DataURL = e.target.result;
      setOriginalImage(base64DataURL);
      
      const base64String = base64DataURL.split(',')[1];
      
      setState('processing');
      try {
        const response = await fetch('http://localhost:5001/caption-image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64String }),
        });

        if (!response.ok) {
          throw new Error('Failed to generate caption');
        }

        const data = await response.text();
        setCaption(data);
        setState('done');
      } catch (error) {
        setState('error');
        setErrorMessage('Failed to generate caption. Please try again.');
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
    setCaption('');
    setErrorMessage('');
    setCopied(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUsePrompt = () => {
    if (onSelectPrompt) onSelectPrompt(caption);
    if (setActiveTab) setActiveTab('generator');
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-medium text-zinc-100">Image to Prompt</h2>
        <p className="text-zinc-400">Extract AI-ready prompts from any image using BLIP.</p>
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
            {state === 'uploading' ? 'Reading image...' : 'Analyzing image...'}
          </p>
          <p className="text-zinc-500 text-sm mt-1">Extracting details to create a prompt</p>
        </div>
      )}

      {state === 'done' && (
        <div className="space-y-6">
          <div className="border border-white/[0.06] rounded-xl bg-zinc-900/30 overflow-hidden">
            <div className="p-4 border-b border-white/[0.06] bg-zinc-900/50">
              <div className="flex items-center gap-2 text-zinc-400 text-sm">
                <ImageIcon className="w-4 h-4" />
                <span>Uploaded Image</span>
              </div>
            </div>
            <div className="flex justify-center p-6 bg-zinc-950/50">
              {originalImage && (
                <img 
                  src={originalImage} 
                  alt="Original" 
                  className="max-h-[300px] object-contain rounded-lg shadow-sm" 
                />
              )}
            </div>
            
            <div className="p-6 border-t border-white/[0.06] space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Generated Prompt</label>
                <div className="p-4 rounded-lg bg-black/40 border border-white/[0.06] text-zinc-300 min-h-[80px] leading-relaxed">
                  {caption}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors text-sm font-medium"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy Caption'}
                </button>
                <button
                  onClick={handleUsePrompt}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors text-sm font-medium ml-auto"
                >
                  <Wand2 className="w-4 h-4" />
                  Use as Prompt
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-start border-t border-white/[0.06] pt-6">
            <button
              onClick={reset}
              className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors text-sm px-4 py-2 -ml-4"
            >
              <X className="w-4 h-4" />
              Try another image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCaptioner;
