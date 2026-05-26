import {motion, AnimatePresence, useDragControls, useMotionValue} from 'motion/react';
import * as LucideIcons from 'lucide-react';
import {X, Minus, Square} from 'lucide-react';
import {ReactNode, useState} from 'react';
import { playSound } from '../lib/audio';

interface WindowProps {
  title: string;
  icon: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onFocus: () => void;
  zIndex: number;
  children: ReactNode;
  isMaximized: boolean;
  isMinimized?: boolean;
  onToggleMaximize: () => void;
}

export default function Window({
  title,
  icon,
  isOpen,
  onClose,
  onMinimize,
  onFocus,
  zIndex,
  children,
  isMaximized,
  isMinimized = false,
  onToggleMaximize,
}: WindowProps) {
  const dragControls = useDragControls();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const [snapState, setSnapState] = useState<'none' | 'left' | 'right' | 'top'>('none');
  const [isDragging, setIsDragging] = useState(false);

  return (
    <>
      <AnimatePresence>
        {isDragging && snapState !== 'none' && (
          <motion.div
            key={snapState}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="fixed pointer-events-none z-[99999] bg-indigo-500/10 border border-indigo-500/30 backdrop-blur-[4px] shadow-[0_0_50px_rgba(99,102,241,0.15)] rounded-3xl"
            style={{
              top: 16,
              bottom: 16,
              left: snapState === 'left' ? 16 : snapState === 'right' ? 'calc(50vw + 8px)' : 16,
              width: snapState === 'top' ? 'calc(100vw - 32px)' : 'calc(50vw - 24px)',
              height: 'calc(100vh - 32px)',
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            drag={!isMaximized}
            dragControls={dragControls}
            dragListener={false}
            dragMomentum={false}
            dragElastic={0.06}
            onDragStart={() => {
              setIsDragging(true);
              if (snapState !== 'none') {
                setSnapState('none');
              }
            }}
            onDrag={(event, info) => {
              const { x: clientX, y: clientY } = info.point;
              const thresh = 80;
              
              if (clientY < thresh) {
                setSnapState('top');
              } else if (clientX < thresh) {
                setSnapState('left');
              } else if (window.innerWidth - clientX < thresh) {
                setSnapState('right');
              } else {
                setSnapState('none');
              }
            }}
            onDragEnd={(event, info) => {
              const { x: clientX, y: clientY } = info.point;
              const thresh = 80;
              
              if (clientY < thresh) {
                if (!isMaximized) {
                  onToggleMaximize();
                }
                setSnapState('none');
              } else if (clientX < thresh) {
                setSnapState('left');
              } else if (window.innerWidth - clientX < thresh) {
                setSnapState('right');
              } else {
                setSnapState('none');
              }
              
              x.set(0);
              y.set(0);
              setIsDragging(false);
            }}
            initial={{scale: 0.9, opacity: 0, y: 50}}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              top: (isMaximized || snapState === 'top' || window.innerWidth < 768) 
                ? 0 
                : snapState === 'left' || snapState === 'right'
                  ? 0
                  : '8%',
              left: (isMaximized || snapState === 'top' || window.innerWidth < 768)
                ? 0
                : snapState === 'left'
                  ? 0
                  : snapState === 'right'
                    ? '50%'
                    : '10%',
              width: (isMaximized || snapState === 'top' || window.innerWidth < 768)
                ? '100%'
                : snapState === 'left' || snapState === 'right'
                  ? '50%'
                  : '80%',
              height: (isMaximized || snapState === 'top' || window.innerWidth < 768)
                ? '100%'
                : snapState === 'left' || snapState === 'right'
                  ? '100%'
                  : '75%',
            }}
            exit={{scale: 0.9, opacity: 0, y: 50}}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 140
            }}
            style={{x, y, zIndex}}
            onClick={onFocus}
            className={`absolute pointer-events-auto overflow-hidden bg-[#0c0d10]/95 backdrop-blur-3xl border border-white/10 shadow-[0_64px_128px_-24px_rgba(0,0,0,1)] flex flex-col ring-1 ring-white/5 transition-all ${(isMaximized || snapState === 'top' || window.innerWidth < 768) ? 'rounded-none' : snapState !== 'none' ? 'rounded-2xl' : 'rounded-[32px]'}`}
          >
            {/* Integrated Titlebar */}
            <div 
              onPointerDown={(e) => {
                if (!isMaximized) {
                  dragControls.start(e);
                }
              }}
              className={`h-14 flex items-center justify-between px-6 bg-white/[0.03] border-b border-white/5 shrink-0 select-none ${isMaximized ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
            >
              <div className="flex items-center gap-4">
                <div className="text-indigo-400 opacity-80">{icon}</div>
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-400">{title}</span>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); playSound('minimize'); onMinimize(); }} 
                  className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-all text-zinc-500 hover:text-white"
                >
                  <Minus size={14} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); playSound('click'); onToggleMaximize(); }}
                  className="w-8 h-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-all text-zinc-500 hover:text-white"
                >
                  <Square size={12} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); playSound('close'); onClose(); }}
                  className="w-8 h-8 rounded-full hover:bg-red-500/20 hover:text-red-500 flex items-center justify-center transition-all text-zinc-500"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto bg-transparent relative">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
