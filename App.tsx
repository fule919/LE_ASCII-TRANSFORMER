import React, { useState, useRef } from 'react';
import { AsciiSettings, ProcessingState } from './types';
import { AsciiCanvas } from './components/AsciiCanvas';
import { RetroButton } from './components/RetroButton';
import { generateSourceImage } from './services/geminiService';

const App: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [settings, setSettings] = useState<AsciiSettings>({
    resolution: 0.7, // Higher default resolution for better detail
    contrast: 1.1,
    brightness: 0,
    invert: false,
    charSetMode: 'detail', // Default to the new detailed mode
  });
  const [uiState, setUiState] = useState<ProcessingState>(ProcessingState.IDLE);
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setImageSrc(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAi = async () => {
    if (!aiPrompt.trim()) return;
    
    setUiState(ProcessingState.GENERATING_AI);
    try {
      // Prompt engineering for better "2.5D" source material
      const enhancedPrompt = `${aiPrompt}, high contrast, dramatic lighting, volumetric fog, black and white photography, depth of field, detailed texture`;
      const generatedImage = await generateSourceImage(enhancedPrompt);
      setImageSrc(generatedImage);
    } catch (error) {
      alert("Failed to generate image.");
    } finally {
      setUiState(ProcessingState.IDLE);
    }
  };

  const downloadCanvas = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `Le_02_${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center justify-center">
      
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Control Panel - Glass Card */}
        <aside className="lg:col-span-4 bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 lg:p-8 shadow-2xl flex flex-col gap-8 order-2 lg:order-1 lg:sticky lg:top-8 h-fit">
          
          <div className="space-y-1">
            <h1 className="text-2xl font-light tracking-tight text-white leading-tight uppercase">LE_ASCII TRANSFORMER</h1>
            <p className="text-xs text-zinc-500 font-medium tracking-wide">IMAGE TO OPTICAL SIGNAL CONVERTER</p>
          </div>

          <div className="space-y-6">
            {/* Input Group */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Source</label>
              
              <div className="grid grid-cols-1 gap-3">
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                />
                <RetroButton 
                  label="Upload Image" 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-full"
                />
                
                <div className="bg-white/5 rounded-2xl p-4 space-y-3 border border-white/5">
                   <div className="flex gap-2">
                     <input 
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Or generate via AI..."
                        className="bg-transparent border-b border-white/10 text-sm p-1 text-white placeholder-zinc-600 focus:outline-none focus:border-white/50 w-full transition-colors"
                     />
                   </div>
                   <RetroButton 
                    label={uiState === ProcessingState.GENERATING_AI ? "Generating..." : "Generate with Gemini"} 
                    onClick={handleGenerateAi}
                    disabled={uiState === ProcessingState.GENERATING_AI || !process.env.API_KEY || !aiPrompt}
                    className="w-full"
                   />
                </div>
              </div>
            </div>

            <hr className="border-white/5" />

            {/* Adjustments Group */}
            <div className="space-y-6">
               <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Adjustments</label>
               
               <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Detail (Density)</span>
                      <span>{Math.round(settings.resolution * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0.1" max="1.0" step="0.05"
                      value={settings.resolution}
                      onChange={(e) => setSettings({...settings, resolution: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Contrast</span>
                      <span>{settings.contrast.toFixed(1)}</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="3.0" step="0.1"
                      value={settings.contrast}
                      onChange={(e) => setSettings({...settings, contrast: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Brightness</span>
                      <span>{settings.brightness}</span>
                    </div>
                    <input 
                      type="range" min="-100" max="100" step="5"
                      value={settings.brightness}
                      onChange={(e) => setSettings({...settings, brightness: parseFloat(e.target.value)})}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-zinc-400">Invert Colors</span>
                    <button 
                      onClick={() => setSettings({...settings, invert: !settings.invert})}
                      className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${settings.invert ? 'bg-white' : 'bg-white/10'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-black shadow-sm transform transition-transform duration-300 ${settings.invert ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </button>
                  </div>
               </div>
            </div>

            <hr className="border-white/5" />

            {/* Mode Group */}
            <div className="space-y-3">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Style</label>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                 {['detail', 'halftone', 'ascii', 'binary', 'blocks'].map((mode) => (
                   <RetroButton
                      key={mode}
                      label={mode}
                      active={settings.charSetMode === mode}
                      onClick={() => setSettings({...settings, charSetMode: mode as any})}
                      className={mode === 'detail' ? 'lg:col-span-2' : ''}
                   />
                 ))}
              </div>
            </div>
            
            <div className="pt-4">
                <RetroButton 
                  label="Download Output" 
                  onClick={downloadCanvas} 
                  disabled={!imageSrc}
                  className="w-full py-4 bg-white/10 hover:bg-white text-white hover:text-black font-bold"
                />
            </div>

          </div>
        </aside>

        {/* Right Viewport - Glass Card with 4:3 Aspect Ratio Container */}
        <div className="lg:col-span-8 flex flex-col order-1 lg:order-2">
           <div className="w-full bg-black/40 backdrop-blur-md border border-white/5 rounded-3xl p-3 shadow-2xl relative">
               
               {/* 4:3 Aspect Ratio Container */}
               <div className="relative w-full aspect-[4/3] rounded-2xl bg-black/50 border border-white/5 overflow-hidden flex items-center justify-center">
                  <AsciiCanvas imageSrc={imageSrc} settings={settings} />
                  
                  {/* Overlay UI elements inside viewport */}
                  <div className="absolute top-4 left-4 text-[10px] font-mono text-white/30 tracking-widest pointer-events-none">
                     CAM_01 [REC]
                  </div>
               </div>

               <div className="mt-4 px-2 flex justify-between items-center opacity-40">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  </div>
                  <span className="text-[10px] font-mono tracking-widest">4:3 DISPLAY_MODE</span>
               </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default App;