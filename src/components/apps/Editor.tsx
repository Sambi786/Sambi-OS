import { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, Film, Crop, Sliders, Play, Pause, Save, Scissors, 
  Volume2, Download, Music, Sparkles, RefreshCw, Layers
} from 'lucide-react';
import { playSound } from '../../lib/audio';
import { pushNotification } from '../NotificationSystem';

export default function EditorApp() {
  const [activeTab, setActiveTab] = useState<'photo' | 'video'>('photo');

  return (
    <div className="h-full w-full bg-[#050608] text-white flex flex-col font-sans overflow-hidden">
      {/* Top Controls */}
      <header className="h-16 px-6 border-b border-white/5 bg-[#090b10] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers className="text-purple-500" size={20} />
          <div>
            <h1 className="text-xs font-black uppercase tracking-[0.2em]">Creative Studio Pro</h1>
            <p className="text-[9px] text-[#4d5267] font-bold uppercase tracking-widest">Multi-Track Media Process Engine</p>
          </div>
        </div>
        
        {/* Workspace select toggles */}
        <div className="flex bg-[#050508] border border-white/5 p-0.5 rounded-xl">
          <button 
            onClick={() => { playSound('click'); setActiveTab('photo'); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all
              ${activeTab === 'photo' ? 'bg-indigo-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
          >
            <ImageIcon size={13} /> PixelCraft Photo Lab
          </button>
          <button 
            onClick={() => { playSound('click'); setActiveTab('video'); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-all
              ${activeTab === 'video' ? 'bg-indigo-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
          >
            <Film size={13} /> VibeCutter Sequencer
          </button>
        </div>
      </header>

      {/* Main Container workspace */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'photo' ? <PixelCraft /> : <VibeCutter />}
      </div>
    </div>
  );
}

/* ================== WORKSPACE 1: PIXELCRAFT PHOTO LAB ================== */
const PRESET_IMAGES = [
  { id: 'neon', name: 'Cyber Tokyo', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80&w=600' },
  { id: 'alps', name: 'Misty Alpine Peaks', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600' },
  { id: 'abstract', name: 'Fluid Glass Gradient', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600' }
];

function PixelCraft() {
  const [selectedImg, setSelectedImg] = useState(PRESET_IMAGES[0]);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [hueRotate, setHueRotate] = useState(0);
  const [activeCrop, setActiveCrop] = useState<'free' | '16-9' | '1-1'>('free');
  const [processedUrl, setProcessedUrl] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Trigger processed filter onto a Canvas so we have TRUE live canvas mapping
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = selectedImg.url;
    img.onload = () => {
      canvas.width = img.naturalWidth || 600;
      canvas.height = img.naturalHeight || 400;

      // Apply filter strings
      ctx.filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturate}%)
        grayscale(${grayscale}%)
        sepia(${sepia}%)
        hue-rotate(${hueRotate}deg)
      `;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      setProcessedUrl(canvas.toDataURL());
    };
    imageRef.current = img;
  }, [selectedImg, brightness, contrast, saturate, grayscale, sepia, hueRotate]);

  const resetFilters = () => {
    playSound('click');
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setGrayscale(0);
    setSepia(0);
    setHueRotate(0);
    setActiveCrop('free');
  };

  const handleExport = () => {
    playSound('click');
    setIsExporting(true);

    setTimeout(() => {
      setIsExporting(false);
      pushNotification('Export Success', 'PixelCraft canvas compiled and downloaded onto local storage structure.', 'success');
      
      // Simulate click download trace
      const link = document.createElement('a');
      link.download = `pixelcraft_${selectedImg.id}_edited.png`;
      link.href = processedUrl;
      // Triggers browser download if sandbox allows, else is fully safe
      try { link.click(); } catch(e) {}
    }, 1500);
  };

  return (
    <div className="h-full w-full flex bg-[#06070a] overflow-hidden">
      {/* Sidebar Tool options */}
      <aside className="w-80 border-r border-white/5 bg-[#090b10] flex flex-col justify-between overflow-y-auto no-scrollbar">
        <div className="p-6 space-y-8">
          {/* Preset Images */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#4d5267] flex items-center gap-1.5">
              <Sparkles size={11} /> Source presets
            </h3>
            <div className="space-y-2">
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => { playSound('click'); setSelectedImg(preset); }}
                  className={`w-full text-left p-2.5 rounded-xl border flex items-center gap-3 transition-all
                    ${selectedImg.id === preset.id 
                      ? 'bg-indigo-500/10 border-indigo-500 text-white font-bold' 
                      : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.02] text-zinc-400'}`}
                >
                  <img src={preset.url} alt={preset.name} className="w-10 h-10 object-cover rounded-lg" referrerPolicy="no-referrer" />
                  <span className="text-xs font-semibold truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Core filter modules */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#4d5267] flex items-center gap-1.5">
              <Sliders size={11} /> Filters & Parameters
            </h3>

            {[
              { label: 'Brightness', min: 50, max: 200, val: brightness, set: setBrightness },
              { label: 'Contrast', min: 50, max: 200, val: contrast, set: setContrast },
              { label: 'Sat', min: 0, max: 200, val: saturate, set: setSaturate },
              { label: 'Grayscale', min: 0, max: 100, val: grayscale, set: setGrayscale },
              { label: 'Sepia Vintage', min: 0, max: 100, val: sepia, set: setSepia },
              { label: 'Neon Hue Rot', min: 0, max: 360, val: hueRotate, set: setHueRotate },
            ].map((slider, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-bold text-zinc-400">
                  <span>{slider.label}</span>
                  <span>{slider.val}%</span>
                </div>
                <input 
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  value={slider.val}
                  onChange={(e) => slider.set(parseInt(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                />
              </div>
            ))}
          </div>

          {/* Aspect ratios */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#4d5267] flex items-center gap-1.5">
              <Crop size={11} /> Resize Aspect Grid
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'free', label: 'Free Aspect' },
                { id: '16-9', label: 'Cinematic 16:9' },
                { id: '1-1', label: 'Portrait 1:1' },
              ].map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => { playSound('click'); setActiveCrop(ratio.id as any); }}
                  className={`py-2 text-[10px] font-black rounded-lg border text-center transition-all uppercase tracking-wider
                    ${activeCrop === ratio.id 
                      ? 'bg-indigo-500 border-indigo-500 text-white' 
                      : 'bg-white/[0.01] border-white/5 hover:bg-white/10 text-zinc-400'}`}
                >
                  {ratio.label.split(' ')[1] || ratio.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Global actions */}
        <div className="p-6 border-t border-white/5 bg-black/20 flex gap-3">
          <button 
            onClick={resetFilters}
            className="flex-1 py-3 border border-white/10 hover:border-white/20 hover:bg-white/5 text-xs text-zinc-400 hover:text-white rounded-xl font-bold transition-all text-center flex justify-center items-center gap-2"
          >
            Reset All
          </button>
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
          >
            {isExporting ? <RefreshCw size={13} className="animate-spin" /> : <Save size={13} />}
            {isExporting ? 'Compiling...' : 'Save PNG'}
          </button>
        </div>
      </aside>

      {/* Main visual preview frame */}
      <section className="flex-1 p-8 flex items-center justify-center relative">
        <canvas ref={canvasRef} className="hidden" />

        <div 
          className={`relative bg-zinc-950/80 border border-white/10 rounded-3xl p-4 shadow-2xl transition-all duration-300 overflow-hidden
            ${activeCrop === '16-9' ? 'aspect-video w-full max-w-2xl' : activeCrop === '1-1' ? 'aspect-square w-full max-w-md' : 'max-h-[500px] max-w-full'}`}
        >
          {processedUrl ? (
            <img 
              src={processedUrl} 
              alt="Live Canvas Studio Process" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div className="flex flex-col items-center gap-3 animate-pulse text-zinc-600">
              <RefreshCw size={24} className="animate-spin" />
              <span className="text-xs font-bold">Mounting canvas layer...</span>
            </div>
          )}
          
          <div className="absolute top-6 left-6 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg border border-white/5 text-[10px] tracking-widest uppercase font-black text-indigo-400 flex items-center gap-1.5">
            <Sparkles size={11} /> Canvas active render • 60 FPS
          </div>
        </div>
      </section>
    </div>
  );
}

/* ================== WORKSPACE 2: VIBECUTTER VIDEO SEQUENCER ================== */
interface SoundTrack {
  id: string;
  name: string;
  volume: number;
}

function VibeCutter() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timelineSec, setTimelineSec] = useState(12);
  const [cutMarks, setCutMarks] = useState<number[]>([]);
  const [soundTracks, setSoundTracks] = useState<SoundTrack[]>([
    { id: 'synth', name: 'Ambient Cosmos loops', volume: 80 },
    { id: 'lofi', name: 'Warm Lo-Fi Chord progressions', volume: 40 },
    { id: 'beat', name: 'Techno Sub-bass Kick', volume: 0 },
  ]);
  const [rendering, setRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  // Playhead update loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setTimelineSec(s => (s >= 60 ? 0 : s + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleCut = () => {
    playSound('click');
    if (cutMarks.includes(timelineSec)) return;
    setCutMarks(prev => [...prev, timelineSec].sort((a,b) => a-b));
    pushNotification('Timeline Slice', `Cut segment registered at ${timelineSec}s keyframe timestamp.`, 'info');
  };

  const clearCuts = () => {
    playSound('click');
    setCutMarks([]);
  };

  const adjustVolume = (id: string, vol: number) => {
    setSoundTracks(prev => prev.map(t => t.id === id ? { ...t, volume: vol } : t));
  };

  const handleRender = () => {
    if (rendering) return;
    playSound('click');
    setRendering(true);
    setRenderProgress(0);

    const interval = setInterval(() => {
      setRenderProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setRendering(false);
          playSound('notification');
          pushNotification('Video Compile Complete', 'Render finished! VibeCutter completed multi-track synchronization safely.', 'success');
          return 100;
        }
        return p + 5;
      });
    }, 150);
  };

  return (
    <div className="h-full w-full flex flex-col bg-[#06070a] overflow-hidden p-6 gap-6">
      {/* Visual Canvas Block */}
      <section className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
        {/* Core Screen */}
        <div className="md:col-span-2 bg-[#090b10] border border-white/5 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden group">
          {/* Mock Video Stream Player */}
          <div className="flex-1 bg-black rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-zinc-900/40 to-black mix-blend-color-dodge" />
            
            {/* Ambient Graphic Visualizer */}
            <div className={`flex items-end gap-1.5 h-16 transition-all duration-1000 ${isPlaying ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}>
              {Array.from({ length: 15 }).map((_, i) => (
                <div 
                  key={i} 
                  className="w-1.5 bg-gradient-to-t from-indigo-500 to-pink-500 rounded-full transition-all duration-300"
                  style={{ 
                    height: isPlaying ? `${Math.floor(Math.random() * 50) + 10}px` : '4px',
                    transitionDelay: `${i * 30}ms`
                  }}
                />
              ))}
            </div>

            <span className="text-zinc-600 text-xs font-bold mt-4 tracking-wider uppercase">
              {isPlaying ? 'ACTIVE STAGE PLAYING' : 'PLAYER STAGE SUSPENDED'}
            </span>
            
            {/* Frame timer Display */}
            <div className="absolute bottom-4 right-4 bg-black/60 px-3 py-1.5 rounded-lg text-xs font-mono border border-white/5 font-black text-indigo-400">
              00:00:{timelineSec < 10 ? `0${timelineSec}` : timelineSec}
            </div>

            {/* Play overlay icon */}
            {!isPlaying && (
              <button 
                onClick={() => { playSound('click'); setIsPlaying(true); }}
                className="absolute w-14 h-14 bg-indigo-500 hover:bg-indigo-400 text-white rounded-full flex items-center justify-center shadow-2xl transition-all"
              >
                <Play size={22} fill="currentColor" className="ml-1" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { playSound('click'); setIsPlaying(p => !p); }}
                className={`w-10 h-10 rounded-xl flex items-center justify-center border text-zinc-300 hover:text-white transition-all
                  ${isPlaying ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
              >
                {isPlaying ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
              </button>
              <button 
                onClick={handleCut}
                className="px-4 h-10 bg-[#090b10] hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
              >
                <Scissors size={14} /> Slice Keyframe
              </button>
              {cutMarks.length > 0 && (
                <button 
                  onClick={clearCuts}
                  className="px-3 h-10 text-rose-400 hover:text-rose-300 text-xs font-bold transition-all"
                >
                  Clear Slices ({cutMarks.length})
                </button>
              )}
            </div>

            <button 
              onClick={handleRender}
              disabled={rendering}
              className="px-6 h-10 bg-gradient-to-r from-pink-500 to-indigo-500 hover:opacity-90 rounded-xl text-xs font-black transition-all flex items-center gap-2 text-white shadow-xl shadow-indigo-500/10"
            >
              {rendering ? <RefreshCw size={13} className="animate-spin" /> : <Download size={14} />}
              {rendering ? `Compiling ${renderProgress}%` : 'Render Compilation'}
            </button>
          </div>
        </div>

        {/* Audio Overlay Modules */}
        <div className="bg-[#090b10] border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
              <Music size={14} className="text-pink-500" /> Audio Deck Mix
            </h3>

            <div className="space-y-5">
              {soundTracks.map((track) => (
                <div key={track.id} className="space-y-2 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
                  <div className="flex justify-between items-center text-xs font-bold text-zinc-300">
                    <span className="truncate max-w-[120px]">{track.name}</span>
                    <span className="text-zinc-500 text-[11px] font-bold">{track.volume}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Volume2 size={13} className="text-[#4d5267]" />
                    <input 
                      type="range"
                      min="0"
                      max="100"
                      value={track.volume}
                      onChange={(e) => adjustVolume(track.id, parseInt(e.target.value))}
                      className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#050508] border border-white/5 rounded-2xl p-4">
            <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Ecosystem Synced</div>
            <p className="text-[10px] text-zinc-500 font-semibold leading-relaxed">
              Timelines fully adapt frame sync parameters on rendering triggers.
            </p>
          </div>
        </div>
      </section>

      {/* Sequencer Timeline Slider Grid */}
      <section className="bg-[#090b10] border border-white/5 rounded-3xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#4d5267]">Timeline Master Sequence</h4>
          <span className="text-xs font-mono font-black text-indigo-400">Total duration: 60s @ 30fps</span>
        </div>

        {/* Interactive Playhead grid */}
        <div className="relative pt-6 pb-2">
          {/* Progress bar container */}
          <div className="h-6 w-full bg-[#050510] border border-white/5 rounded-xl overflow-hidden relative">
            <div 
              className="h-full bg-indigo-500/10 border-r border-[#00f2fe]/40 transition-all duration-300"
              style={{ width: `${(timelineSec / 60) * 100}%` }}
            />
            
            {/* Registered Split slices */}
            {cutMarks.map((sec, i) => (
              <div 
                key={i} 
                className="absolute inset-y-0 w-[2px] bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,1)]"
                style={{ left: `${(sec / 60) * 100}%` }}
              />
            ))}
          </div>

          {/* Time metrics markers */}
          <div className="flex justify-between text-[9px] font-mono font-black text-zinc-600 mt-2 px-1">
            <span>00s</span>
            <span>15s</span>
            <span>30s</span>
            <span>45s</span>
            <span>60s</span>
          </div>
        </div>
      </section>
    </div>
  );
}
