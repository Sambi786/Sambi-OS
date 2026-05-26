import {motion, AnimatePresence} from 'motion/react';
import {Settings, Image as ImageIcon, Monitor, RefreshCw, X} from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: string) => void;
}

export default function ContextMenu({x, y, isOpen, onClose, onAction}: ContextMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-[6000]" 
            onClick={onClose}
          />
          <motion.div
            initial={{opacity: 0, scale: 0.95}}
            animate={{opacity: 1, scale: 1}}
            exit={{opacity: 0, scale: 0.95}}
            style={{top: y, left: x}}
            className="fixed z-[6001] min-w-[200px] bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden p-1.5"
          >
            <div className="flex flex-col gap-0.5">
              <button 
                onClick={() => { onAction('settings'); onClose(); }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-300 hover:text-white"
              >
                <Settings size={14} className="text-zinc-500" />
                <span className="text-xs font-medium">Display Settings</span>
              </button>
              <button 
                onClick={() => { onAction('wallpaper'); onClose(); }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-300 hover:text-white"
              >
                <ImageIcon size={14} className="text-zinc-500" />
                <span className="text-xs font-medium">Change Background</span>
              </button>
              <button 
                onClick={() => { onAction('terminal'); onClose(); }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-300 hover:text-white"
              >
                <Monitor size={14} className="text-zinc-500" />
                <span className="text-xs font-medium">Open in Terminal</span>
              </button>
              <div className="h-[1px] bg-white/5 my-1" />
              <button 
                onClick={() => { window.location.reload(); }}
                className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors text-zinc-300 hover:text-white"
              >
                <RefreshCw size={14} className="text-zinc-500" />
                <span className="text-xs font-medium">Refresh Desktop</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
