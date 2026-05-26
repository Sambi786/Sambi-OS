import {useState, useEffect, MouseEvent} from 'react';
import {motion} from 'motion/react';
import * as LucideIcons from 'lucide-react';
import Taskbar from './Taskbar';
import Window from './Window';
import BraveApp from './apps/Brave';
import TerminalApp from './apps/Terminal';
import FilesApp from './apps/Files';
import NotesApp from './apps/Notes';
import SettingsApp from './apps/Settings';
import LockScreen from './LockScreen';
import AppMenu from './AppMenu';
import ContextMenu from './ContextMenu';
import CalculatorApp from './apps/Calculator';
import GithubApp from './apps/Github';
import MediaApp from './apps/Media';
import PerformanceApp from './apps/Performance';
import StoreApp from './apps/Store';
import GameApp from './apps/Game';
import EditorApp from './apps/Editor';
import ApkRunnerApp from './apps/ApkRunner';
import PdfReaderApp from './apps/PdfReader';
import DesktopIcon from './DesktopIcon';
import {APPS, WALLPAPERS} from '../constants';
import {AppId, WindowState} from '../types';

import NotificationSystem, { pushNotification, toggleNotificationCenter } from './NotificationSystem';
import { playSound, getSoundMode, SoundMode } from '../lib/audio';
import QuickSettings from './QuickSettings';

export default function Desktop() {
  const [windows, setWindows] = useState<Record<AppId, WindowState>>({
    brave: {id: 'brave', isOpen: false, isMinimized: false, isMaximized: true, zIndex: 1},
    terminal: {id: 'terminal', isOpen: false, isMinimized: false, isMaximized: true, zIndex: 1},
    files: {id: 'files', isOpen: false, isMinimized: false, isMaximized: true, zIndex: 1},
    settings: {id: 'settings', isOpen: false, isMinimized: false, isMaximized: true, zIndex: 1},
    notes: {id: 'notes', isOpen: false, isMinimized: false, isMaximized: true, zIndex: 1},
    calculator: {id: 'calculator', isOpen: false, isMinimized: false, isMaximized: true, zIndex: 1},
    github: {id: 'github', isOpen: false, isMinimized: false, isMaximized: true, zIndex: 1},
    media: {id: 'media', isOpen: false, isMinimized: false, isMaximized: true, zIndex: 1},
    performance: {id: 'performance', isOpen: false, isMinimized: false, isMaximized: true, zIndex: 1},
    store: {id: 'store', isOpen: false, isMinimized: false, isMaximized: true, zIndex: 1},
    game: {id: 'game', isOpen: false, isMinimized: false, isMaximized: true, zIndex: 1},
    editor: {id: 'editor', isOpen: false, isMinimized: false, isMaximized: true, zIndex: 1},
    apk_runner: {id: 'apk_runner', isOpen: false, isMinimized: false, isMaximized: true, zIndex: 1},
    pdf_reader: {id: 'pdf_reader', isOpen: false, isMinimized: false, isMaximized: true, zIndex: 1},
  });
  const [installedApps, setInstalledApps] = useState<AppId[]>(() => {
    const saved = localStorage.getItem('sambi_installed_apps');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('sambi_installed_apps', JSON.stringify(installedApps));
  }, [installedApps]);
  const [activeApp, setActiveApp] = useState<AppId | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWorkspaceActive, setIsWorkspaceActive] = useState(false);
  const [time, setTime] = useState(new Date());
  const [contextMenu, setContextMenu] = useState({isOpen: false, x: 0, y: 0});
  const [wallpaper, setWallpaper] = useState(() => {
    const saved = localStorage.getItem('sambi_wallpaper');
    return saved || WALLPAPERS[0].url;
  });

  // Quick Settings & Power states
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
  const [isWifiOn, setIsWifiOn] = useState(true);
  const [currentWifiSSID, setCurrentWifiSSID] = useState('Sambi_Secure');
  const [soundMode, setSoundModeState] = useState<SoundMode>(() => {
    if (typeof window === 'undefined') return 'sound';
    return getSoundMode();
  });
  const [isBatterySaver, setIsBatterySaver] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [batteryLevel, setBatteryLevel] = useState(84);
  const [hasNotifiedCritical, setHasNotifiedCritical] = useState(false);
  const [isVibrating, setIsVibrating] = useState(false);

  // Real-time parity simulations
  const [telemetryHistory, setTelemetryHistory] = useState<{cpu: number, mem: number}[]>(
    Array.from({length: 10}, () => ({cpu: 10 + Math.random() * 20, mem: 4 + Math.random() * 0.5}))
  );

  useEffect(() => {
    const notifications = [
      { t: 'Security', m: 'Encrypted tunnel synchronized across all nodes.', s: 'info' as const },
      { t: 'Kernel', m: 'Memory heap cleared. 1.2GB reclaimed.', s: 'success' as const },
      { t: 'Network', m: 'Brave Browser ready for zero-knowledge session.', s: 'info' as const },
      { t: 'Intelligence', m: 'Neural core adapted to current workflow.', s: 'success' as const },
    ];

    const interval = setInterval(() => {
      // Suppress background messages if battery saver is on
      if (isBatterySaver) {
        // Slow down telemetry update under Battery Saver
        setTelemetryHistory(prev => {
          const next = {
            cpu: Math.floor(Math.random() * 8) + 3, // Throttled low CPU
            mem: parseFloat((4 + Math.random() * 0.1).toFixed(1)) // Stabilized memory
          };
          return [...prev.slice(1), next];
        });
        return;
      }

      const n = notifications[Math.floor(Math.random() * notifications.length)];
      pushNotification(n.t, n.m, n.s);
      
      // Update telemetry
      setTelemetryHistory(prev => {
        const next = {
          cpu: Math.floor(Math.random() * 20) + 10,
          mem: parseFloat((4 + Math.random() * 0.5).toFixed(1))
        };
        return [...prev.slice(1), next];
      });
    }, 15000); // More frequent for "real-time" feel

    return () => clearInterval(interval);
  }, [isBatterySaver]);

  // Battery Drain and Vibration Event listeners
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel(prev => {
        // Battery saver drains battery much slower (-0.02% per tick vs -0.1%)
        const drainRate = isBatterySaver ? 0.02 : 0.1;
        const next = prev > 1 ? prev - drainRate : 84;
        return next;
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [isBatterySaver]);

  useEffect(() => {
    if (batteryLevel < 15 && !hasNotifiedCritical) {
      pushNotification(
        'System Alert',
        'Emergency Shutdown Pending: Battery has dropped below 15% threshold.',
        'error'
      );
      setHasNotifiedCritical(true);
    } else if (batteryLevel >= 15 && hasNotifiedCritical) {
      setHasNotifiedCritical(false);
    }
  }, [batteryLevel, hasNotifiedCritical]);

  // Watch for custom sound-driven vibration event
  useEffect(() => {
    const handleVibrate = () => {
      setIsVibrating(true);
      setTimeout(() => setIsVibrating(false), 200);
    };
    const handleToggleQuick = () => {
      setQuickSettingsOpen(prev => !prev);
    };
    window.addEventListener('sambi_vibrate', handleVibrate);
    window.addEventListener('TOGGLE_SAMBI_QUICK_SETTINGS', handleToggleQuick);
    return () => {
      window.removeEventListener('sambi_vibrate', handleVibrate);
      window.removeEventListener('TOGGLE_SAMBI_QUICK_SETTINGS', handleToggleQuick);
    };
  }, []);

  const openApp = (id: AppId) => {
    const windowValues = Object.values(windows) as WindowState[];
    const maxZ = Math.max(...windowValues.map(w => w.zIndex)) + 1;
    setWindows(prev => ({
      ...prev,
      [id]: {...prev[id], isOpen: true, isMinimized: false, zIndex: maxZ},
    }));
    setActiveApp(id);
    playSound('launch');
    
    // Real-time behavior: log app opening
    pushNotification('App Launched', `${id.toUpperCase()} is now running in persistent memory.`, 'info');
  };

  const closeApp = (id: AppId) => {
    setWindows(prev => ({
      ...prev,
      [id]: {...prev[id], isOpen: false},
    }));
    if (activeApp === id) setActiveApp(null);
  };

  useEffect(() => {
    localStorage.setItem('sambi_wallpaper', wallpaper);
  }, [wallpaper]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000); 
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        setIsLocked(true);
      }
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
      if (e.metaKey || e.key === 'Meta') {
        e.preventDefault();
        setIsMenuOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    const handleToggleMenu = () => setIsMenuOpen(prev => !prev);
    window.addEventListener('TOGGLE_SAMBI_MENU', handleToggleMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('TOGGLE_SAMBI_MENU', handleToggleMenu);
    };
  }, []);

  const focusApp = (id: AppId) => {
    const windowValues = Object.values(windows) as WindowState[];
    const maxZ = Math.max(...windowValues.map(w => w.zIndex)) + 1;
    setWindows(prev => ({
      ...prev,
      [id]: {...prev[id], isMinimized: false, zIndex: maxZ},
    }));
    setActiveApp(id);
  };

  const minimizeApp = (id: AppId) => {
    setWindows(prev => ({
      ...prev,
      [id]: {...prev[id], isMinimized: true},
    }));
    setActiveApp(null);
  };

  const toggleMaximize = (id: AppId) => {
    setWindows(prev => ({
      ...prev,
      [id]: {...prev[id], isMaximized: !prev[id].isMaximized},
    }));
  };

  const openApps = (Object.entries(windows) as [AppId, WindowState][])
    .filter(([_, w]) => w.isOpen)
    .map(([id]) => id);

  const isAnyMaximized = (Object.values(windows) as WindowState[]).some(w => w.isOpen && w.isMaximized && !w.isMinimized);

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleDesktopAction = (action: string) => {
    if (action === 'settings' || action === 'wallpaper') {
      openApp('settings');
    } else if (action === 'terminal') {
      openApp('terminal');
    }
  };

  return (
    <div 
      onContextMenu={handleContextMenu}
      className={`h-screen w-screen relative overflow-hidden bg-[#0c0d10] text-zinc-100 flex flex-col transition-all duration-300 ${isVibrating ? 'animate-vibrate' : ''}`}
      style={{
        filter: `brightness(${brightness}%) ${isBatterySaver ? 'sepia(8%) contrast(92%)' : ''}`,
        transition: 'filter 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Background Layer */}
      <motion.div 
        key={wallpaper}
        initial={{opacity: 0}}
        animate={{opacity: 1}}
        transition={{duration: 1}}
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{backgroundImage: `url(${wallpaper})`}}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '30px 30px'}}></div>
      </motion.div>

      {/* Top System Bar - Floating Island Style */}
      <div className={`fixed top-2 left-0 right-0 z-[100] px-4 pointer-events-none transition-all duration-500 ${isAnyMaximized ? 'opacity-0 -translate-y-full hover:opacity-100 hover:translate-y-0' : 'opacity-100'}`}>
        <nav className="h-10 mx-auto max-w-4xl bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex items-center justify-between px-6 pointer-events-auto shadow-2xl ring-1 ring-black/50">
          <div className="flex items-center gap-6">
            <div onClick={() => setIsMenuOpen(true)} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 px-2 py-1 rounded-lg transition-all group">
              <div className="w-5 h-5 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                <LucideIcons.Command size={12} className="text-white" />
              </div>
              <span className="text-[11px] font-bold tracking-tight text-white/90">Sambi</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10" />
            <div className="flex gap-4">
              <button 
                onClick={() => {
                  setIsWorkspaceActive(prev => !prev);
                  pushNotification('Workspace Mode', isWorkspaceActive ? 'Dashboard focus disabled.' : 'Kernel telemetry overlay active.', 'info');
                }}
                className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-all ${isWorkspaceActive ? 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' : 'text-zinc-400 hover:text-white'}`}
              >
                Workspace
              </button>
              {activeApp && (
                <motion.div 
                  layoutId="active-indicator"
                  className="flex items-center gap-2 text-[11px] font-bold text-indigo-400 capitalize bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  {activeApp}
                </motion.div>
              )}
            </div>
          </div>
          
          <div className="text-[11px] font-bold text-zinc-200 tracking-tight">
            {time.toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'})} • {time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={toggleNotificationCenter}
              className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white transition-all relative group"
            >
              <LucideIcons.Bell size={14} className="group-hover:rotate-12 transition-transform" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full border border-black" />
            </button>
            <button 
              onClick={() => { playSound('click'); setQuickSettingsOpen(true); }}
              className="flex gap-2.5 items-center bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 px-3.5 py-1 rounded-full text-zinc-400 hover:text-white transition-all cursor-pointer group"
            >
              {isWifiOn ? <LucideIcons.Wifi size={13} className="text-indigo-400" /> : <LucideIcons.WifiOff size={13} className="text-rose-500/85" />}
              {soundMode === 'mute' ? <LucideIcons.VolumeX size={13} className="text-rose-500" /> : soundMode === 'vibrate' ? <LucideIcons.Smartphone size={13} className="text-amber-500" /> : <LucideIcons.Volume2 size={13} className="text-indigo-400" />}
              {isBatterySaver ? <LucideIcons.Leaf size={11} className="text-emerald-400 animate-pulse" /> : <LucideIcons.BatteryMedium size={13} className={batteryLevel > 50 ? 'text-indigo-400' : 'text-amber-400'} />}
            </button>
            <button 
              onClick={() => setIsLocked(true)}
              className="p-1.5 hover:bg-red-500/20 hover:text-red-500 rounded-lg text-zinc-400 transition-all"
            >
              <LucideIcons.Power size={14} />
            </button>
          </div>
        </nav>
      </div>


      {/* Desktop Workspace - Atmospheric Layout */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 group/desktop overflow-y-auto no-scrollbar">
        {/* Absolute Desktop Icons Grid on Left */}
        <div className="absolute left-6 top-24 bottom-24 w-28 md:w-32 flex flex-col items-center gap-5 z-20 overflow-y-auto no-scrollbar pointer-events-auto py-4">
          <DesktopIcon 
            name="Brave" 
            icon="Globe" 
            color="bg-orange-600" 
            onOpen={() => openApp('brave')} 
          />
          <DesktopIcon 
            name="App Store" 
            icon="ShoppingBag" 
            color="bg-gradient-to-br from-indigo-500 to-pink-500" 
            onOpen={() => openApp('store')} 
          />
          <DesktopIcon 
            name="Settings" 
            icon="Settings" 
            color="bg-zinc-600" 
            onOpen={() => openApp('settings')} 
          />
          
          {/* Installed Dynamic Apps */}
          {installedApps.includes('game') && (
            <DesktopIcon 
              name="Sambi Arcade" 
              icon="Gamepad2" 
              color="bg-emerald-500" 
              onOpen={() => openApp('game')} 
            />
          )}
          {installedApps.includes('editor') && (
            <DesktopIcon 
              name="Creative Studio" 
              icon="Image" 
              color="bg-purple-500" 
              onOpen={() => openApp('editor')} 
            />
          )}
          {installedApps.includes('apk_runner') && (
            <DesktopIcon 
              name="Sambi Droid" 
              icon="Smartphone" 
              color="bg-lime-600" 
              onOpen={() => openApp('apk_runner')} 
            />
          )}
          {installedApps.includes('pdf_reader') && (
            <DesktopIcon 
              name="Sambi Reader" 
              icon="BookOpen" 
              color="bg-rose-600" 
              onOpen={() => openApp('pdf_reader')} 
            />
          )}
        </div>

        {/* Atmospheric Nucleus */}
        <motion.div 
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 1.5, ease: "easeOut"}}
          className="w-full max-w-5xl flex flex-col items-center gap-12 transition-all duration-700 relative py-12"
        >
          {/* Main Visual Node */}
          <div className="w-full flex flex-col items-center space-y-12 pt-12 md:pt-20">
            <div className="relative group/nucleus">
              <motion.div
                initial={{scale: 0.9, opacity: 0}}
                animate={{scale: 1, opacity: 1}}
                transition={{delay: 0.2, duration: 1.2}}
                className="relative z-10 text-center"
              >
                <div className="relative">
                  <h1 className="text-[8rem] md:text-[12rem] font-black tracking-tighter text-white/[0.02] select-none pointer-events-none leading-none">
                    SAMBI
                  </h1>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-5xl md:text-8xl font-bold text-white tracking-tight">
                       {time.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false})}
                     </span>
                     <div className="flex items-center gap-3 mt-2">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em]">
                          System Optimized
                        </span>
                     </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Floating Telemetry Pods */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl transition-all duration-1000 delay-500 ${
              isWorkspaceActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}>
              {[
                { label: 'CPU', value: `${telemetryHistory[telemetryHistory.length-1].cpu}%`, icon: LucideIcons.Cpu },
                { label: 'MEM', value: `${telemetryHistory[telemetryHistory.length-1].mem}GB`, icon: LucideIcons.Activity },
                { label: 'NET', value: 'SECURE', icon: LucideIcons.ShieldCheck }
              ].map((stat, i) => (
                <div key={i} className="bg-white/5 backdrop-blur-3xl p-6 rounded-[32px] border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all shadow-xl overflow-hidden relative">
                   <div className="flex flex-col z-10">
                     <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</div>
                     <div className="text-xl font-bold text-white tracking-tight">{stat.value}</div>
                   </div>
                   
                   {/* Mini Sparkline Background */}
                   <div className="absolute inset-0 opacity-10 pointer-events-none">
                     <div className="absolute bottom-0 left-0 right-0 h-12 flex items-end gap-1 px-4">
                        {telemetryHistory.map((h, idx) => (
                          <div 
                            key={idx}
                            className="flex-1 bg-indigo-500 transition-all duration-500"
                            style={{ 
                              height: `${stat.label === 'CPU' ? h.cpu : stat.label === 'MEM' ? (h.mem - 4) * 100 : 40}%`,
                              opacity: (idx + 1) / telemetryHistory.length
                            }}
                          />
                        ))}
                     </div>
                   </div>

                   <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform text-indigo-400 z-10">
                     <stat.icon size={18} />
                   </div>
                </div>
              ))}
            </div>
            
            {!isWorkspaceActive && (
              <motion.button
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
                onClick={() => setIsWorkspaceActive(true)}
                className="group flex items-center gap-4 px-10 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all relative"
              >
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_12px_rgba(99,102,241,0.6)]" />
                <span className="text-[11px] font-black text-zinc-400 group-hover:text-white uppercase tracking-[0.4em]">Engage Workspace</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Deep Atmospheric Accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-indigo-600/10 blur-[200px] rounded-full animate-float opacity-30" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-violet-600/10 blur-[180px] rounded-full animate-float opacity-30" style={{animationDelay: '-4s'}} />
          <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-500/10 blur-[180px] rounded-full animate-float opacity-30" style={{animationDelay: '-2s'}} />
        </div>
      </main>

      {/* Windows Overlay */}
      <NotificationSystem />
      <div className="absolute inset-0 pointer-events-none z-20">
        <div className="relative w-full h-full pointer-events-none overflow-hidden">
          {/* Brave Window */}
          <Window
            title="Brave"
            icon={<LucideIcons.Globe size={14} />}
            isOpen={windows.brave.isOpen}
            isMinimized={windows.brave.isMinimized}
            zIndex={windows.brave.zIndex}
            isMaximized={windows.brave.isMaximized}
            onClose={() => closeApp('brave')}
            onMinimize={() => minimizeApp('brave')}
            onFocus={() => focusApp('brave')}
            onToggleMaximize={() => toggleMaximize('brave')}
          >
            <BraveApp isOnline={isWifiOn} />
          </Window>

          {/* Terminal Window */}
          <Window
            title="Terminal"
            icon={<LucideIcons.Terminal size={14} />}
            isOpen={windows.terminal.isOpen}
            isMinimized={windows.terminal.isMinimized}
            zIndex={windows.terminal.zIndex}
            isMaximized={windows.terminal.isMaximized}
            onClose={() => closeApp('terminal')}
            onMinimize={() => minimizeApp('terminal')}
            onFocus={() => focusApp('terminal')}
            onToggleMaximize={() => toggleMaximize('terminal')}
          >
            <TerminalApp />
          </Window>
          
          <Window
             title="Files"
             icon={<LucideIcons.Folder size={14} />}
             isOpen={windows.files.isOpen}
             isMinimized={windows.files.isMinimized}
             zIndex={windows.files.zIndex}
             isMaximized={windows.files.isMaximized}
             onClose={() => closeApp('files')}
             onMinimize={() => minimizeApp('files')}
             onFocus={() => focusApp('files')}
             onToggleMaximize={() => toggleMaximize('files')}
          >
             <FilesApp />
          </Window>
          
          <Window
             title="Settings"
             icon={<LucideIcons.Settings size={14} />}
             isOpen={windows.settings.isOpen}
             isMinimized={windows.settings.isMinimized}
             zIndex={windows.settings.zIndex}
             isMaximized={windows.settings.isMaximized}
             onClose={() => closeApp('settings')}
             onMinimize={() => minimizeApp('settings')}
             onFocus={() => focusApp('settings')}
             onToggleMaximize={() => toggleMaximize('settings')}
          >
             <SettingsApp 
                currentWallpaper={wallpaper} 
                onWallpaperChange={setWallpaper} 
             />
          </Window>

          <Window
             title="Notes"
             icon={<LucideIcons.FileText size={14} />}
             isOpen={windows.notes.isOpen}
             isMinimized={windows.notes.isMinimized}
             zIndex={windows.notes.zIndex}
             isMaximized={windows.notes.isMaximized}
             onClose={() => closeApp('notes')}
             onMinimize={() => minimizeApp('notes')}
             onFocus={() => focusApp('notes')}
             onToggleMaximize={() => toggleMaximize('notes')}
          >
             <NotesApp />
          </Window>

          <Window
             title="Calculator"
             icon={<LucideIcons.Calculator size={14} />}
             isOpen={windows.calculator.isOpen}
             isMinimized={windows.calculator.isMinimized}
             zIndex={windows.calculator.zIndex}
             isMaximized={windows.calculator.isMaximized}
             onClose={() => closeApp('calculator')}
             onMinimize={() => minimizeApp('calculator')}
             onFocus={() => focusApp('calculator')}
             onToggleMaximize={() => toggleMaximize('calculator')}
          >
             <CalculatorApp />
          </Window>

          <Window
             title="GitHub"
             icon={<LucideIcons.Github size={14} />}
             isOpen={windows.github.isOpen}
             isMinimized={windows.github.isMinimized}
             zIndex={windows.github.zIndex}
             isMaximized={windows.github.isMaximized}
             onClose={() => closeApp('github')}
             onMinimize={() => minimizeApp('github')}
             onFocus={() => focusApp('github')}
             onToggleMaximize={() => toggleMaximize('github')}
          >
             <GithubApp />
          </Window>

          <Window
             title="Media"
             icon={<LucideIcons.Play size={14} />}
             isOpen={windows.media.isOpen}
             isMinimized={windows.media.isMinimized}
             zIndex={windows.media.zIndex}
             isMaximized={windows.media.isMaximized}
             onClose={() => closeApp('media')}
             onMinimize={() => minimizeApp('media')}
             onFocus={() => focusApp('media')}
             onToggleMaximize={() => toggleMaximize('media')}
          >
             <MediaApp />
          </Window>

          <Window
             title="Performance"
             icon={<LucideIcons.Activity size={14} />}
             isOpen={windows.performance.isOpen}
             isMinimized={windows.performance.isMinimized}
             zIndex={windows.performance.zIndex}
             isMaximized={windows.performance.isMaximized}
             onClose={() => closeApp('performance')}
             onMinimize={() => minimizeApp('performance')}
             onFocus={() => focusApp('performance')}
             onToggleMaximize={() => toggleMaximize('performance')}
          >
             <PerformanceApp />
          </Window>

          {/* App Store Window */}
          <Window
             title="App Store"
             icon={<LucideIcons.ShoppingBag size={14} />}
             isOpen={windows.store.isOpen}
             isMinimized={windows.store.isMinimized}
             zIndex={windows.store.zIndex}
             isMaximized={windows.store.isMaximized}
             onClose={() => closeApp('store')}
             onMinimize={() => minimizeApp('store')}
             onFocus={() => focusApp('store')}
             onToggleMaximize={() => toggleMaximize('store')}
          >
             <StoreApp 
                installedApps={installedApps as any}
                onInstall={(id) => {
                  setInstalledApps(prev => prev.includes(id) ? prev : [...prev, id]);
                  openApp(id as any);
                }}
                onOpenApp={(id) => openApp(id as any)}
                onUninstall={(id) => {
                  setInstalledApps(prev => prev.filter(a => a !== id));
                  closeApp(id);
                }}
             />
          </Window>

          {/* Sambi Arcade Window */}
          <Window
             title="Sambi Arcade"
             icon={<LucideIcons.Gamepad2 size={14} />}
             isOpen={windows.game.isOpen}
             isMinimized={windows.game.isMinimized}
             zIndex={windows.game.zIndex}
             isMaximized={windows.game.isMaximized}
             onClose={() => closeApp('game')}
             onMinimize={() => minimizeApp('game')}
             onFocus={() => focusApp('game')}
             onToggleMaximize={() => toggleMaximize('game')}
          >
             <GameApp />
          </Window>

          {/* Creative Studio Window */}
          <Window
             title="Creative Studio"
             icon={<LucideIcons.Image size={14} />}
             isOpen={windows.editor.isOpen}
             isMinimized={windows.editor.isMinimized}
             zIndex={windows.editor.zIndex}
             isMaximized={windows.editor.isMaximized}
             onClose={() => closeApp('editor')}
             onMinimize={() => minimizeApp('editor')}
             onFocus={() => focusApp('editor')}
             onToggleMaximize={() => toggleMaximize('editor')}
          >
             <EditorApp />
          </Window>

          {/* Sambi Droid Window */}
          <Window
             title="Sambi Droid"
             icon={<LucideIcons.Smartphone size={14} />}
             isOpen={windows.apk_runner.isOpen}
             isMinimized={windows.apk_runner.isMinimized}
             zIndex={windows.apk_runner.zIndex}
             isMaximized={windows.apk_runner.isMaximized}
             onClose={() => closeApp('apk_runner')}
             onMinimize={() => minimizeApp('apk_runner')}
             onFocus={() => focusApp('apk_runner')}
             onToggleMaximize={() => toggleMaximize('apk_runner')}
          >
             <ApkRunnerApp />
          </Window>

          {/* PDF Reader Window */}
          <Window
             title="Sambi PDF Reader"
             icon={<LucideIcons.BookOpen size={14} />}
             isOpen={windows.pdf_reader.isOpen}
             isMinimized={windows.pdf_reader.isMinimized}
             zIndex={windows.pdf_reader.zIndex}
             isMaximized={windows.pdf_reader.isMaximized}
             onClose={() => closeApp('pdf_reader')}
             onMinimize={() => minimizeApp('pdf_reader')}
             onFocus={() => focusApp('pdf_reader')}
             onToggleMaximize={() => toggleMaximize('pdf_reader')}
          >
             <PdfReaderApp />
          </Window>
        </div>
      </div>

      <Taskbar
        activeApp={activeApp}
        openApps={openApps}
        onLauncherClick={() => setIsMenuOpen(prev => !prev)}
        isMenuOpen={isMenuOpen}
        onSetMenuOpen={setIsMenuOpen}
        onAppClick={(id) => {
          if (windows[id].isOpen) {
            if (activeApp === id) {
              minimizeApp(id);
            } else {
              focusApp(id);
            }
          } else {
            openApp(id);
          }
        }}
        time={time}
        isWifiOn={isWifiOn}
        currentWifiSSID={currentWifiSSID}
        soundMode={soundMode}
        isBatterySaver={isBatterySaver}
        batteryLevel={batteryLevel}
        onQuickSettingsClick={() => { playSound('click'); setQuickSettingsOpen(p => !p); }}
      />

      {/* Overlays */}
      <AppMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onAppClick={openApp} 
        installedApps={installedApps}
      />
      <LockScreen 
        isLocked={isLocked} 
        onUnlock={() => setIsLocked(false)} 
        time={time} 
      />
      <ContextMenu 
        {...contextMenu} 
        onClose={() => setContextMenu(prev => ({...prev, isOpen: false}))}
        onAction={handleDesktopAction}
      />
      
      {/* Sambi Control Hub Quick Settings */}
      <QuickSettings 
        isOpen={quickSettingsOpen}
        onClose={() => setQuickSettingsOpen(false)}
        isWifiOn={isWifiOn}
        setIsWifiOn={setIsWifiOn}
        currentWifiSSID={currentWifiSSID}
        setCurrentWifiSSID={setCurrentWifiSSID}
        soundMode={soundMode}
        setSoundModeState={setSoundModeState}
        isBatterySaver={isBatterySaver}
        setIsBatterySaver={(active) => {
          setIsBatterySaver(active);
          pushNotification(
            active ? 'Eco Mode Enabled' : 'Eco Mode Disabled',
            active ? 'Background activities throttled. Power drain rate reduced.' : 'Background activities restored. Maximum performance active.',
            active ? 'warning' : 'success'
          );
        }}
        batteryLevel={batteryLevel}
        brightness={brightness}
        setBrightness={setBrightness}
      />
    </div>
  );
}
