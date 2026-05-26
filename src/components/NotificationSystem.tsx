
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Info, AlertTriangle, CheckCircle, Trash2, History } from 'lucide-react';
import { playSound } from '../lib/audio';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: Date;
}

let notificationCallback: (n: Notification) => void = () => {};
let toggleHistoryCallback: () => void = () => {};

export const pushNotification = (title: string, message: string, type: NotificationType = 'info') => {
  playSound('notification');
  notificationCallback({
    id: Math.random().toString(36).substr(2, 9),
    title,
    message,
    type,
    timestamp: new Date(),
  });
};

export const toggleNotificationCenter = () => {
  toggleHistoryCallback();
};

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [history, setHistory] = useState<Notification[]>([]);
  const [isCenterOpen, setIsCenterOpen] = useState(false);

  useEffect(() => {
    notificationCallback = (n: Notification) => {
      // Active toast
      setNotifications(prev => [n, ...prev].slice(0, 5));
      // Persistent history
      setHistory(prev => [n, ...prev].slice(0, 50));
      
      // Auto-remove toast after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(item => item.id !== n.id));
      }, 5000);
    };

    toggleHistoryCallback = () => {
      setIsCenterOpen(prev => !prev);
    };
  }, []);

  const removeNotification = (id: string, fromHistory = false) => {
    if (fromHistory) {
      setHistory(prev => prev.filter(n => n.id !== id));
    } else {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <>
      {/* Active Toasts */}
      <div className="fixed top-20 right-6 z-[1000] flex flex-col gap-4 pointer-events-none w-80">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              className={`pointer-events-auto relative overflow-hidden bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl group ring-1 ring-white/5`}
            >
              <div className={`absolute top-0 left-0 w-1 h-full ${
                n.type === 'success' ? 'bg-emerald-500' :
                n.type === 'warning' ? 'bg-amber-500' :
                n.type === 'error' ? 'bg-rose-500' :
                'bg-indigo-500'
              }`} />
              
              <div className="flex gap-3">
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  n.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                  n.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                  n.type === 'error' ? 'bg-rose-500/10 text-rose-400' :
                  'bg-indigo-500/10 text-indigo-400'
                }`}>
                  {n.type === 'success' ? <CheckCircle size={14} /> :
                   n.type === 'warning' ? <AlertTriangle size={14} /> :
                   n.type === 'error' ? <X size={14} /> :
                   <Info size={14} />}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-white/90">{n.title}</h4>
                    <button 
                      onClick={() => removeNotification(n.id)}
                      className="text-zinc-500 hover:text-white transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">{n.message}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Notification Center Drawer */}
      <AnimatePresence>
        {isCenterOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCenterOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[900]"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-[#0c0d10]/90 backdrop-blur-3xl border border-white/10 z-[901] shadow-[0_80px_160px_-40px_rgba(0,0,0,0.9)] flex flex-col rounded-[64px] ring-1 ring-white/10 overflow-hidden max-h-[80vh]"
            >
              <div className="p-10 pb-8 flex items-center justify-between border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-indigo-500 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40">
                    <History size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tight text-white/90">System Telemetry</h3>
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-1">Kernel History Node</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsCenterOpen(false)}
                  className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="w-20 h-20 bg-white/5 rounded-[40px] flex items-center justify-center text-zinc-700">
                      <Bell size={40} />
                    </div>
                    <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest leading-relaxed">
                      No system events captured in current session.
                    </p>
                  </div>
                ) : (
                  history.map((n) => (
                    <div key={n.id} className="relative bg-white/5 rounded-3xl p-5 border border-white/5 group hover:bg-white/[0.08] transition-all">
                       <div className="flex gap-4">
                          <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center ${
                            n.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                            n.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                            n.type === 'error' ? 'bg-rose-500/10 text-rose-400' :
                            'bg-indigo-500/10 text-indigo-400'
                          }`}>
                            {n.type === 'success' ? <CheckCircle size={18} /> :
                             n.type === 'warning' ? <AlertTriangle size={18} /> :
                             n.type === 'error' ? <X size={18} /> :
                             <Info size={18} />}
                          </div>
                          <div className="flex-1 space-y-1">
                             <div className="flex items-center justify-between">
                                <h4 className="text-sm font-black tracking-tight text-white/90">{n.title}</h4>
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter">
                                   {n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                             </div>
                             <p className="text-xs text-zinc-400 leading-relaxed font-bold">{n.message}</p>
                          </div>
                       </div>
                    </div>
                  ))
                )}
              </div>

              {history.length > 0 && (
                <div className="p-6 border-t border-white/5">
                  <button 
                    onClick={clearHistory}
                    className="w-full h-12 rounded-2xl bg-white/5 hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center gap-3 text-[11px] font-black uppercase tracking-widest transition-all border border-white/5"
                  >
                    <Trash2 size={16} />
                    Clear Storage
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

