import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Image as ImageIcon, Video, Music, Scissors, Sliders, Save, Download, X, Maximize2, RotateCcw, Contrast, Sun } from 'lucide-react';

import { getFS, FileNode } from '../../lib/fs';

interface MediaFile {
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
}

export default function MediaApp() {
  const [fs] = useState<FileNode[]>(getFS());
  
  // Extract all media files from FS
  const getAllMedia = (nodes: FileNode[]): MediaFile[] => {
    let results: MediaFile[] = [];
    nodes.forEach(node => {
      if (node.type === 'file') {
        const ext = node.name.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
          results.push({ name: node.name, type: 'image', url: node.content || '' });
        } else if (['mp4', 'webm', 'ogg'].includes(ext || '')) {
          results.push({ name: node.name, type: 'video', url: node.content || '' });
        } else if (['mp3', 'wav', 'ogg'].includes(ext || '')) {
          results.push({ name: node.name, type: 'audio', url: node.content || '' });
        }
      } else if (node.type === 'folder' && node.children) {
        results = [...results, ...getAllMedia(node.children)];
      }
    });
    return results;
  };

  const [mediaList] = useState<MediaFile[]>(() => {
    const list = getAllMedia(fs);
    return list.length > 0 ? list : [
      { name: 'Mountain View.png', type: 'image', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80' },
      { name: 'Night Drive.mp3', type: 'audio', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' }
    ];
  });

  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(mediaList[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [volume, setVolume] = useState(80);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (selectedMedia?.type === 'video' && videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    } else if (selectedMedia?.type === 'audio' && audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setGrayscale(0);
  };

  return (
    <div className="flex h-full bg-[#0c0d10] text-zinc-300 font-sans">
      {/* Library Sidebar */}
      <aside className="w-56 border-r border-white/5 flex flex-col bg-black/20 shrink-0">
        <div className="p-6">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-6">Media Library</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2">Recent</span>
              <div className="space-y-1">
                {mediaList.map((media, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      setSelectedMedia(media);
                      setIsPlaying(false);
                      resetFilters();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] font-bold transition-all ${
                      selectedMedia?.name === media.name ? 'bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'
                    }`}
                  >
                    {media.type === 'image' && <ImageIcon size={14} />}
                    {media.type === 'video' && <Video size={14} />}
                    {media.type === 'audio' && <Music size={14} />}
                    <span className="truncate">{media.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Stage */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Viewport */}
        <div className="flex-1 relative flex items-center justify-center p-8 bg-black/40">
          {selectedMedia?.type === 'image' && (
            <div className="relative group max-w-full max-h-full">
              <img 
                src={selectedMedia.url} 
                alt={selectedMedia.name}
                style={{ filter: `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%)` }}
                className="max-w-full max-h-[70vh] rounded-3xl shadow-2xl transition-all duration-300"
              />
            </div>
          )}

          {selectedMedia?.type === 'video' && (
            <div className="w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/5">
              <video 
                ref={videoRef}
                src={selectedMedia.url} 
                className="w-full h-full"
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          )}

          {selectedMedia?.type === 'audio' && (
            <div className="w-full max-w-xl p-12 bg-white/5 backdrop-blur-3xl rounded-[48px] border border-white/10 flex flex-col items-center gap-8 shadow-2xl ring-1 ring-white/5">
              <div className="w-48 h-48 bg-rose-500/20 rounded-full flex items-center justify-center border border-rose-500/30 animate-pulse">
                <Music size={64} className="text-rose-400" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">{selectedMedia.name}</h3>
                <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Sambi Audio Engine</p>
              </div>
              <audio 
                ref={audioRef}
                src={selectedMedia.url}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <footer className="h-24 bg-[#0c0d10] border-t border-white/5 flex items-center justify-between px-8 gap-12">
          {/* Playback Controls */}
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-all"><SkipBack size={20} /></button>
            <button 
              onClick={togglePlay}
              className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl shadow-white/10"
            >
              {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
            </button>
            <button className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-all"><SkipForward size={20} /></button>
          </div>

          {/* Contextual Editor Controls */}
          <div className="flex-1 flex items-center gap-8 justify-center">
            {selectedMedia?.type === 'image' ? (
              <div className="flex items-center gap-6 bg-white/5 px-6 py-2 rounded-full border border-white/5">
                <div className="flex items-center gap-3">
                  <Sun size={14} className="text-zinc-500" />
                  <input 
                    type="range" min="50" max="150" value={brightness} 
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-24 h-1 bg-white/10 rounded-full accent-rose-500" 
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Contrast size={14} className="text-zinc-500" />
                  <input 
                    type="range" min="50" max="150" value={contrast} 
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-24 h-1 bg-white/10 rounded-full accent-rose-500" 
                  />
                </div>
                <button 
                  onClick={resetFilters}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-white transition-all"
                  title="Reset Filters"
                >
                  <RotateCcw size={14} />
                </button>
              </div>
            ) : (
                <div className="flex items-center gap-4 bg-white/5 px-6 py-2 rounded-full border border-white/5">
                  <Volume2 size={16} className="text-zinc-500" />
                  <input 
                    type="range" min="0" max="100" value={volume} 
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-32 h-1 bg-white/10 rounded-full accent-rose-500" 
                  />
                </div>
            )}
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/5">
              <Sliders size={14} />
              Advanced
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-rose-500/20">
              <Save size={14} />
              Export
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}
