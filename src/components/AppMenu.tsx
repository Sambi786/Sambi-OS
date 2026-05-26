import {useState} from 'react';
import {motion, AnimatePresence} from 'motion/react';
import * as LucideIcons from 'lucide-react';
import {APPS} from '../constants';
import {AppId} from '../types';

interface AppMenuProps {
  isOpen: boolean;
  onAppClick: (id: AppId) => void;
  onClose: () => void;
  installedApps: AppId[];
}

export default function AppMenu({isOpen, onAppClick, onClose, installedApps}: AppMenuProps) {
  const [search, setSearch] = useState('');
  
  const filteredApps = APPS.filter(app => {
    const isDownloadable = ['game', 'editor', 'apk_runner', 'pdf_reader'].includes(app.id);
    if (isDownloadable) {
      return installedApps.includes(app.id);
    }
    return true;
  }).filter(app => 
    app.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          className="fixed inset-0 z-[5000] bg-black/20 backdrop-blur-3xl flex items-center justify-end p-8 overflow-hidden"
          onClick={onClose}
        >
          {/* Main Container - Sliding from right */}
          <motion.div 
            initial={{x: '100%', opacity: 0}}
            animate={{x: 0, opacity: 1}}
            exit={{x: '120%', opacity: 0}}
            transition={{type: 'spring', damping: 24, stiffness: 140}}
            className="w-full max-w-2xl h-full flex flex-col bg-[#0c0d10]/90 border border-white/10 rounded-[64px] shadow-[0_64px_128px_-24px_rgba(0,0,0,1)] ring-1 ring-white/5 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Minimalist Search Area */}
            <div className="p-12 pb-8">
              <div className="flex items-center gap-6 bg-white/5 border border-white/10 rounded-[32px] px-8 py-5 group focus-within:ring-4 ring-indigo-500/20 transition-all">
                <LucideIcons.Search className="text-zinc-500 group-focus-within:text-white transition-colors" size={24} />
                <input 
                  type="text" 
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Intelligence Search..."
                  className="bg-transparent border-none outline-none text-xl font-bold text-white flex-1 placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Vertical Scroll Area */}
            <div className="flex-1 overflow-y-auto px-12 pb-12 no-scrollbar">
              <div className="space-y-12">
                {/* Apps Section */}
                <section>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400/80 mb-8 px-2">Core Applications</h4>
                  <div className="grid grid-cols-4 gap-6">
                    {filteredApps.map((app) => {
                      const IconComponent = (LucideIcons as any)[app.icon];
                      return (
                        <button
                          key={app.id}
                          onClick={() => {
                            onAppClick(app.id);
                            onClose();
                          }}
                          className="flex flex-col items-center gap-4 group p-5 bg-white/5 rounded-[32px] border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all"
                        >
                          <div className={`w-12 h-12 ${app.color} rounded-2xl flex items-center justify-center text-white shadow-xl transition-transform duration-500 group-hover:scale-110 group-active:scale-95`}>
                            <IconComponent size={20} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">{app.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* System Insights Section */}
                <section className="grid grid-cols-1 gap-6">
                  <div className="bg-indigo-500/10 border border-indigo-500/10 rounded-[48px] p-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px] rounded-full translate-x-10 -translate-y-10" />
                    <LucideIcons.Cpu className="text-indigo-400 mb-6" size={32} />
                    <h4 className="text-2xl font-black text-white tracking-tighter mb-2">Neural Optimization</h4>
                    <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">Kernel performance is within optimal parameters. All background nodes are encrypted.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white/5 rounded-[40px] p-8 border border-white/5 flex flex-col items-center gap-3">
                       <LucideIcons.Shield className="text-emerald-400" size={24} />
                       <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Privacy</div>
                       <div className="text-xl font-bold text-white tracking-widest">ACTUAL</div>
                    </div>
                    <div className="bg-white/5 rounded-[40px] p-8 border border-white/5 flex flex-col items-center gap-3">
                       <LucideIcons.Zap className="text-amber-400" size={24} />
                       <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Efficiency</div>
                       <div className="text-xl font-bold text-white tracking-widest">100%</div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
            
            {/* Footer */}
            <div className="p-8 border-t border-white/5 bg-black/20 flex justify-center">
               <div className="text-[9px] font-black text-zinc-700 tracking-[0.5em] uppercase">Sambi Core OS • v2.0</div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
