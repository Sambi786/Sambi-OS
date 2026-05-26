import {motion, AnimatePresence} from 'motion/react';
import {Lock, ArrowRight, Power, RefreshCw} from 'lucide-react';
import {useState, FormEvent} from 'react';

interface LockScreenProps {
  isLocked: boolean;
  onUnlock: () => void;
  time: Date;
}

export default function LockScreen({isLocked, onUnlock, time}: LockScreenProps) {
  const [password, setPassword] = useState('');

  const handleUnlock = (e: FormEvent) => {
    e.preventDefault();
    onUnlock();
    setPassword('');
  };

  return (
    <AnimatePresence>
      {isLocked && (
        <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-zinc-950"
        >
          {/* Background Ambient Blur */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-12">
            {/* Clock */}
            <div className="flex flex-col items-center text-zinc-100">
              <motion.span 
                initial={{y: 20, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                transition={{delay: 0.1}}
                className="text-6xl md:text-8xl font-thin tracking-tighter"
              >
                {time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false})}
              </motion.span>
              <motion.span 
                initial={{y: 20, opacity: 0}}
                animate={{y: 0, opacity: 1}}
                transition={{delay: 0.2}}
                className="text-lg md:text-xl font-medium text-zinc-400 mt-2"
              >
                {time.toLocaleDateString([], {weekday: 'long', month: 'long', day: 'numeric'})}
              </motion.span>
            </div>

            {/* Auth UI */}
            <motion.div 
               initial={{scale: 0.9, opacity: 0}}
               animate={{scale: 1, opacity: 1}}
               transition={{delay: 0.3}}
               className="flex flex-col items-center gap-6"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center border border-white/10 shadow-2xl">
                  <div className="w-8 h-8 rounded-lg bg-orange-600 rotate-12 flex items-center justify-center">
                    <span className="text-black font-bold text-xs">S</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-zinc-200">Sambi User</span>
              </div>

              <form onSubmit={handleUnlock} className="relative group">
                <input 
                  type="password"
                  autoFocus
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-full px-6 py-2.5 text-sm text-zinc-200 outline-none focus:border-orange-500/50 focus:ring-4 ring-orange-500/10 w-64 transition-all"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1.5 p-1.5 bg-orange-600 rounded-full text-black hover:bg-orange-500 transition-colors"
                >
                  <ArrowRight size={14} />
                </button>
              </form>

              <button 
                onClick={onUnlock}
                className="text-[10px] text-zinc-500 hover:text-zinc-300 font-bold uppercase tracking-widest transition-colors"
              >
                Enter as guest
              </button>
            </motion.div>
          </div>

          {/* Bottom Bar */}
          <div className="absolute bottom-8 left-0 right-0 px-12 flex justify-between items-center z-10">
            <div className="flex gap-6 text-zinc-600">
               <RefreshCw size={20} className="hover:text-zinc-400 cursor-pointer transition-colors" />
               <Power size={20} className="hover:text-red-500 cursor-pointer transition-colors" />
            </div>
            <div className="flex items-center gap-2 text-zinc-600">
               <Lock size={14} />
               <span className="text-[10px] font-bold uppercase tracking-widest">SAMBI Secure</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
