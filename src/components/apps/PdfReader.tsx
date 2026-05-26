import { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Minus, ChevronLeft, ChevronRight, Highlighter, 
  Paperclip, Tag, FileText, Search, Star, MessageSquare, Trash2, Upload,
  Play, Pause, Volume2, VolumeX
} from 'lucide-react';
import { playSound } from '../../lib/audio';
import { pushNotification } from '../NotificationSystem';

interface PDFDoc {
  id: string;
  name: string;
  author: string;
  pages: string[];
  size: string;
  readTime: string;
}

export default function PdfReaderApp() {
  const [docs, setDocs] = useState<PDFDoc[]>([
    {
      id: 'core_os',
      name: 'Sambi OS architecture specs.pdf',
      author: 'Kernel Core Group',
      size: '1.4 MB',
      readTime: '15 min read',
      pages: [
        "Sambi Core OS operates as a high-integrity, sandboxed microkernel OS running in user space. It distributes core telemetry modules dynamically across standard threads, reducing overhead under high UI frames rendering. Memory allocation utilizes dynamic chunking vectors, reclaiming unused nodes systematically without blocking main event loops.",
        "The taskbar command node integrates direct click sound trigger loops. System properties like Eco Mode throttle background timers by 80%, reducing battery drain rates. Display brightness is processed via real-time sepia and contrast canvas matrices, protecting user visual nerves dynamically during dark ambient cycles.",
        "Privacy architectures ensure total zero-knowledge verification. Brave instances operate with standard multi-threaded isolation layers. Terminal commands run inside sandboxed processes, keeping filesystem integrity preserved against unauthorized operations."
      ]
    },
    {
      id: 'react_arch',
      name: 'Interactive React architecture manual.pdf',
      author: 'Developer Evangelists',
      size: '840 KB',
      readTime: '8 min read',
      pages: [
        "Modern React applications require clean separation of concerns. Modularizing file layouts is crucial: share global TypeScript interfaces in a central types file, and isolate specific widget processes into dedicated folders. Placing all processes into single giant files causes token exhaustion and slows compile performance.",
        "Vite serves as assembly-optimized transpilers. HMR overrides operate by replacing individual modules on-the-fly without state reloads. Hot Module replacement is suppressed in agent environments to allow coherent sequence saves and protect state flicker indices.",
        "Effective React hooks prevent recursive triggers. Always isolate complex arrays inside memoized dependencies, and prefer primitive keys inside useEffect watches. Sub-component structures should be highly functional, utilizing simple props and callbacks rather than nested parent states."
      ]
    },
    {
      id: 'universe_scroll',
      name: 'Secrets of the Universe scroll.pdf',
      author: 'Ecosystem Archivist',
      size: '2.8 MB',
      readTime: '45 min read',
      pages: [
        "Beneath standard gravity parameters lie fluid cosmic coordinates. Space architectures expand in waves, matching the sine oscillations of audio synth generators. The laws of digital mechanics dictate that true design elegance comes purely from spacing tracking, typography size variance, and bold pixel constraints.",
        "The cosmic slate layout uses soft dark blues (#0c0d10) combined with deep indigo glows. It simulates high-contrast starlight coordinates, giving user workspaces a focused, magical vibe. True craftsmanship rejects noisy grid decorations, preferring negative spaces and honest, humbler visual elements.",
        "To reach orbit velocity, systems must balance weight constraints. Avoid stacking unnecessary framework packages, relying purely on Tailwind components and simple, lightweight library nodes. The finest systems perform complex workflows asynchronously, notifying users with subtle vibration curves."
      ]
    }
  ]);

  const [activeDocId, setActiveDocId] = useState('core_os');
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [highlightActive, setHighlightActive] = useState(false);
  const [highlightedText, setHighlightedText] = useState<Record<string, Record<number, boolean>>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [noteInput, setNoteInput] = useState('');

  const activeDoc = docs.find(d => d.id === activeDocId) || docs[0];

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Automatically cancel read-aloud spoken queue when navigating pages/docs
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentPage, activeDocId]);

  const handleSpeak = () => {
    playSound('click');
    if (!('speechSynthesis' in window)) {
      pushNotification('TTS Not Supported', 'Speech synthesis is not supported in this browser.', 'warning');
      return;
    }

    const synth = window.speechSynthesis;

    if (isSpeaking) {
      if (isPaused) {
        synth.resume();
        setIsPaused(false);
        pushNotification('Reading Resumed', 'Continuing document page narration and voice playback.', 'success');
      } else {
        synth.pause();
        setIsPaused(true);
        pushNotification('Reading Paused', 'Narration suspended. Click Play button to resume speak.', 'warning');
      }
    } else {
      synth.cancel();

      const text = activeDoc.pages[currentPage];
      if (!text) return;

      const utterance = new SpeechSynthesisUtterance(text);
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };
      utterance.onerror = (e) => {
        // Speech synthesis cancellation fires error on stop/cancel, handle cleanly
        if (e.error !== 'interrupted') {
          setIsSpeaking(false);
          setIsPaused(false);
        }
      };

      synth.speak(utterance);
      setIsSpeaking(true);
      setIsPaused(false);
      pushNotification('Reading Page Aloud', 'Digital narrator is reading the page aloud.', 'success');
    }
  };

  const handleStopSpeaking = () => {
    playSound('click');
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
    pushNotification('Narration Stopped', 'Voice playback sequence cleared.', 'warning');
  };

  const handleDocChange = (id: string) => {
    playSound('click');
    setActiveDocId(id);
    setCurrentPage(0);
  };

  const handleNextPage = () => {
    if (currentPage < activeDoc.pages.length - 1) {
      playSound('click');
      setCurrentPage(p => p + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      playSound('click');
      setCurrentPage(p => p - 1);
    }
  };

  const increaseZoom = () => {
    playSound('click');
    setZoom(z => Math.min(z + 10, 180));
  };

  const decreaseZoom = () => {
    playSound('click');
    setZoom(z => Math.max(z - 10, 70));
  };

  // Attach a page note
  const handleSaveNote = () => {
    playSound('click');
    if (!noteInput.trim()) return;
    const noteKey = `${activeDocId}_page_${currentPage}`;
    setNotes(prev => ({
      ...prev,
      [noteKey]: noteInput.trim()
    }));
    setNoteInput('');
    pushNotification('Sticky Note Attached', 'Memo notes saved to local page keyframe.', 'success');
  };

  const handleClearNote = () => {
    playSound('click');
    const noteKey = `${activeDocId}_page_${currentPage}`;
    setNotes(prev => {
      const next = { ...prev };
      delete next[noteKey];
      return next;
    });
    pushNotification('Sticky Note Removed', 'Memo deleted.', 'warning');
  };

  const handleCustomFile = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    playSound('click');
    
    // Read local file mock style
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const paragraphs = content.split('\n\n').filter(p => p.trim());
      
      const newDoc: PDFDoc = {
        id: `user_${Date.now()}`,
        name: `${file.name.replace('.txt', '')}.pdf`,
        author: 'User Mount',
        size: `${Math.round(file.size / 1024)} KB`,
        readTime: 'Custom upload',
        pages: paragraphs.length > 0 ? paragraphs : ['Empty custom text file loaded is empty.']
      };

      setDocs(prev => [newDoc, ...prev]);
      setActiveDocId(newDoc.id);
      setCurrentPage(0);
      pushNotification('PDF Custom File Loaded', `Successfully converted and mounted "${file.name}" into virtual PDF library.`, 'success');
    };
    reader.readAsText(file);
  };

  const noteKey = `${activeDocId}_page_${currentPage}`;
  const pageNote = notes[noteKey];

  return (
    <div className="h-full w-full flex bg-[#06070a] overflow-hidden text-white font-sans">
      
      {/* Sidebar Library */}
      <aside className="w-80 border-r border-[#15151a] bg-[#090b10] flex flex-col justify-between overflow-y-auto no-scrollbar">
        <div className="p-6 space-y-8">
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">PDF Reader Hub</h3>
            <p className="text-[11px] leading-relaxed text-zinc-500">
              Browse workspace document books, view tech specifications, and upload custom manuals.
            </p>
          </div>

          {/* Book Stack */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-650">System Library</h4>
            
            <div className="space-y-2">
              {docs.map((doc) => {
                const isActive = doc.id === activeDocId;
                return (
                  <button
                    key={doc.id}
                    onClick={() => handleDocChange(doc.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border flex items-start gap-3.5 transition-all
                      ${isActive 
                        ? 'bg-indigo-500/10 border-indigo-500 text-white' 
                        : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.02] text-zinc-400'}`}
                  >
                    <BookOpen size={16} className={`mt-0.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-600'}`} />
                    <div className="min-w-0">
                      <h4 className="text-xs font-black truncate leading-tight group-hover:text-white">{doc.name}</h4>
                      <span className="text-[9px] font-bold text-zinc-650 block mt-1">{doc.author} • {doc.size}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upload Custom manual */}
        <div className="p-6 border-t border-white/5 bg-black/20 m-4 rounded-[24px]">
          <label className="flex flex-col items-center gap-2 border border-dashed border-white/10 hover:border-indigo-500/30 p-5 rounded-xl cursor-pointer transition-all">
            <Upload size={18} className="text-zinc-500" />
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Attach Custom Document</span>
            <input 
              type="file" 
              accept=".txt" 
              onChange={handleCustomFile}
              className="hidden" 
            />
          </label>
        </div>
      </aside>

      {/* Reader Panel View */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#06070a]">
        
        {/* PDF Top actions bar */}
        <header className="h-16 border-b border-[#15151a] px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <FileText size={16} className="text-rose-500 shrink-0" />
            <span className="text-xs font-black truncate text-zinc-300 uppercase tracking-wider">{activeDoc.name}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Speech Synthesis (TTS) Read Aloud Trigger */}
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
              <button 
                onClick={handleSpeak}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer
                  ${isSpeaking && !isPaused
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20' 
                    : 'text-zinc-400 hover:text-white'}`}
              >
                {isSpeaking && !isPaused ? <Pause size={12} className="animate-pulse" /> : <Play size={12} />}
                {isSpeaking ? (isPaused ? 'Resume' : 'Pause') : 'Play'}
              </button>
              
              {isSpeaking && (
                <button 
                  onClick={handleStopSpeaking}
                  className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                >
                  Stop
                </button>
              )}
            </div>

            {/* Zoom Widget */}
            <div className="flex items-center gap-2.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
              <button onClick={decreaseZoom} className="text-zinc-400 hover:text-white transition-colors">
                <Minus size={13} />
              </button>
              <span className="text-[10px] font-mono font-black text-indigo-400 w-10 text-center">{zoom}%</span>
              <button onClick={increaseZoom} className="text-zinc-400 hover:text-white transition-colors">
                <Plus size={13} />
              </button>
            </div>

            {/* Highlighter trigger */}
            <button 
              onClick={() => { playSound('click'); setHighlightActive(!highlightActive); }}
              className={`w-9 h-9 border rounded-xl flex items-center justify-center transition-all
                ${highlightActive 
                  ? 'bg-amber-500 border-amber-500 text-black shadow-lg shadow-amber-500/10' 
                  : 'bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10'}`}
            >
              <Highlighter size={14} />
            </button>
          </div>
        </header>

        {/* Reader Core Canvas Body */}
        <div className="flex-1 overflow-y-auto p-12 flex justify-center no-scrollbar bg-[#050508]/40">
          <div className="max-w-2xl w-full flex flex-col gap-8 min-h-0">
            
            {/* Editable Content Frame */}
            <article 
              className={`bg-[#0a0c10] border border-white/5 p-12 pr-16 pl-16 rounded-[40px] shadow-3xl transition-all duration-300 relative overflow-hidden`}
              style={{ fontSize: `${(zoom / 100) * 14}px`, lineHeight: 1.8 }}
            >
              {/* Top Watermark details */}
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 border-b border-white/5 pb-4 mb-8">
                <span>Core Document Reader</span>
                <span>Page {currentPage + 1} of {activeDoc.pages.length}</span>
              </div>

              {/* Text content page */}
              <p 
                onClick={() => {
                  if (highlightActive) {
                    playSound('click');
                    const key = `${activeDocId}_${currentPage}`;
                    setHighlightedText(prev => ({
                      ...prev,
                      [key]: {
                        ...prev[key],
                        [currentPage]: !prev[key]?.[currentPage]
                      }
                    }));
                  }
                }}
                className={`text-zinc-300 font-serif leading-relaxed tracking-wide select-text cursor-pointer transition-colors duration-200
                  ${highlightedText[`${activeDocId}_${currentPage}`]?.[currentPage] 
                    ? 'bg-amber-400/20 text-white shadow-[0_0_12px_rgba(251,191,36,0.15)] px-2 py-1 rounded border border-amber-500/10' 
                    : ''}`}
              >
                {activeDoc.pages[currentPage]}
              </p>

              {/* Layout decorations subtle grid */}
              <div className="absolute top-2 right-4 text-[7px] font-mono tracking-widest text-zinc-700">SAMBI SECURE PDF WRITER</div>
            </article>

            {/* Page switching controls footer */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-zinc-500 tracking-widest uppercase">
                {activeDoc.readTime}
              </span>

              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center text-zinc-300"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[11px] font-sans font-black text-white px-2">
                  PAGE {currentPage + 1} OF {activeDoc.pages.length}
                </span>
                <button 
                  onClick={handleNextPage}
                  disabled={currentPage === activeDoc.pages.length - 1}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center justify-center text-zinc-300"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Sticky Memo notes drawer attachable per page */}
            <div className="border border-white/5 bg-[#090b10] p-6 rounded-[28px] space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-[#4d5267] flex items-center gap-1.5">
                <MessageSquare size={13} className="text-indigo-400" /> Attached Page Memo Note
              </h4>

              {pageNote ? (
                <div className="bg-amber-400/5 border border-amber-500/20 p-4 rounded-xl flex items-start justify-between gap-4 animate-scale-up">
                  <div className="space-y-1">
                    <span className="text-[8px] font-black uppercase text-amber-500 tracking-wider">memo page attachment</span>
                    <p className="text-xs font-semibold leading-relaxed text-amber-300">{pageNote}</p>
                  </div>
                  <button 
                    onClick={handleClearNote}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2.5">
                  <input 
                    type="text" 
                    placeholder="Attach custom stick notes memo on this page..."
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveNote()}
                    className="flex-1 bg-[#050508] border border-white/5 hover:border-white/10 focus:border-indigo-500/40 outline-none rounded-xl px-4 py-2 text-xs font-bold text-white transition-all placeholder:text-zinc-600"
                  />
                  <button 
                    onClick={handleSaveNote}
                    className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white hover:scale-102 active:scale-95 transition-all rounded-xl text-xs font-black uppercase tracking-wider text-center"
                  >
                    Attach Note
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

      </main>

    </div>
  );
}
