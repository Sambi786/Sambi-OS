import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Wifi, WifiOff, Volume2, VolumeX, Smartphone, Zap, Leaf, 
  Check, Sliders, ChevronDown, ChevronUp, RefreshCw, AlertTriangle, Sun
} from 'lucide-react';
import { playSound, setSoundMode, getSoundMode, SoundMode } from '../lib/audio';

interface QuickSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  // Wi-Fi States
  isWifiOn: boolean;
  setIsWifiOn: (on: boolean) => void;
  currentWifiSSID: string;
  setCurrentWifiSSID: (ssid: string) => void;
  // Sound States
  soundMode: SoundMode;
  setSoundModeState: (mode: SoundMode) => void;
  // Battery States
  isBatterySaver: boolean;
  setIsBatterySaver: (active: boolean) => void;
  batteryLevel: number;
  // Brightness States
  brightness: number;
  setBrightness: (b: number) => void;
}

const WIFI_NETWORKS = [
  { ssid: 'Sambi_Secure', strength: 4, security: 'WPA3' },
  { ssid: 'DeepMind_Guest', strength: 3, security: 'None' },
  { ssid: 'Antigravity_Mesh_5G', strength: 4, security: 'WPA3 Enterprise' },
  { ssid: 'Satellite_Bypass', strength: 2, security: 'WPA2' },
];

export default function QuickSettings({
  isOpen,
  onClose,
  isWifiOn,
  setIsWifiOn,
  currentWifiSSID,
  setCurrentWifiSSID,
  soundMode,
  setSoundModeState,
  isBatterySaver,
  setIsBatterySaver,
  batteryLevel,
  brightness,
  setBrightness,
}: QuickSettingsProps) {
  const [isWifiListOpen, setIsWifiListOpen] = useState(false);
  const [connectingSSID, setConnectingSSID] = useState<string | null>(null);
  const [runDiagnostic, setRunDiagnostic] = useState(false);
  const [diagnosticProgress, setDiagnosticProgress] = useState(0);
  const [diagnosticReport, setDiagnosticReport] = useState<string | null>(null);

  // Auto close list if Wi-Fi is turned off
  useEffect(() => {
    if (!isWifiOn) {
      setIsWifiListOpen(false);
    }
  }, [isWifiOn]);

  const handleWifiToggle = () => {
    playSound('click');
    setIsWifiOn(!isWifiOn);
  };

  const handleConnectWifi = (ssid: string) => {
    playSound('click');
    if (ssid === currentWifiSSID) return;
    setConnectingSSID(ssid);
    
    // Simulate connection lag
    setTimeout(() => {
      setCurrentWifiSSID(ssid);
      setConnectingSSID(null);
      playSound('launch');
    }, 1800);
  };

  const handleSoundModeChange = (mode: SoundMode) => {
    playSound('click');
    setSoundMode(mode);
    setSoundModeState(mode);
    
    // Tiny delay to play sound feedback correctly inside new mode
    setTimeout(() => {
      if (mode === 'sound') {
        playSound('click');
      } else if (mode === 'vibrate') {
        playSound('click'); // will trigger the vibrate rumbling synthesis!
      }
    }, 50);
  };

  const handleBatterySaverToggle = () => {
    playSound('click');
    setIsBatterySaver(!isBatterySaver);
  };

  const startLocalDiagnostic = () => {
    playSound('click');
    setRunDiagnostic(true);
    setDiagnosticProgress(0);
    setDiagnosticReport(null);
  };

  useEffect(() => {
    if (!runDiagnostic) return;
    const interval = setInterval(() => {
      setDiagnosticProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDiagnosticReport(
            `Diagnostic Complete:\n• Active cells: 4/4\n• Temp: ${isBatterySaver ? '29.4°C (Eco Cool)' : '38.2°C (Warm)'}\n• Estimated Rate: -${isBatterySaver ? '1.8%/hr (Optimized)' : '5.4%/hr (Full Perf)'}\n• Health: Excellent (98.4% capacity)`
          );
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [runDiagnostic, isBatterySaver]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop click dismisser */}
          <div 
            className="fixed inset-0 z-[100] cursor-default" 
            onClick={onClose} 
          />

          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-20 right-6 md:right-12 w-full max-w-sm bg-[#0a0a0d]/90 backdrop-blur-3xl border border-white/10 z-[101] rounded-[36px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] p-6 overflow-hidden ring-1 ring-white/5 select-none text-left"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/5">
              <div>
                <h3 className="text-xs font-black tracking-[0.2em] uppercase text-zinc-400">Sambi Control Hub</h3>
                <p className="text-[9px] font-mono text-zinc-600 mt-0.5 uppercase">Kernel Settings Interface</p>
              </div>
              <div className="flex items-center gap-2">
                {isBatterySaver && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] font-black text-amber-500 uppercase tracking-widest animate-pulse">
                    <Leaf size={10} /> Eco Mode
                  </span>
                )}
              </div>
            </div>

            {/* Quick Toggle Grid */}
            <section className="grid grid-cols-2 gap-3 mb-5">
              {/* Wi-Fi Control */}
              <div 
                className={`p-4 rounded-2xl border transition-all h-24 flex flex-col justify-between 
                  ${isWifiOn 
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-white shadow-lg' 
                    : 'bg-white/[0.02] border-white/5 text-zinc-500 hover:bg-white/5'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <button 
                    onClick={handleWifiToggle}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all 
                      ${isWifiOn ? 'bg-indigo-500 text-white' : 'bg-white/5 hover:bg-white/10 text-zinc-400'}`}
                  >
                    {isWifiOn ? <Wifi size={16} /> : <WifiOff size={16} />}
                  </button>
                  <button 
                    disabled={!isWifiOn}
                    onClick={() => { playSound('click'); setIsWifiListOpen(!isWifiListOpen); }}
                    className={`p-1.5 rounded-lg text-zinc-400 transition-colors ${isWifiOn ? 'hover:bg-white/5 cursor-pointer' : 'opacity-20 cursor-not-allowed'}`}
                  >
                    {isWifiListOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                </div>
                <div className="text-left mt-2 min-h-[25px]">
                  <div className="text-[10px] font-black uppercase tracking-wider leading-none">Wi-Fi</div>
                  <div className="text-[9px] font-medium text-zinc-500 mt-1 truncate">
                    {isWifiOn ? currentWifiSSID : 'Disconnected'}
                  </div>
                </div>
              </div>

              {/* Battery Saver Control */}
              <button 
                onClick={handleBatterySaverToggle}
                className={`p-4 rounded-2xl border transition-all h-24 flex flex-col justify-between text-left
                  ${isBatterySaver 
                    ? 'bg-amber-500/10 border-amber-500/30 text-white shadow-lg' 
                    : 'bg-white/[0.02] border-white/5 text-zinc-500 hover:bg-white/5'
                  }`}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all bg-white/5 text-zinc-400">
                  <Leaf size={16} className={isBatterySaver ? 'text-amber-500' : 'text-zinc-400'} />
                </div>
                <div className="mt-2">
                  <div className="text-[10px] font-black uppercase tracking-wider leading-none">Battery Saver</div>
                  <div className="text-[9px] font-medium text-zinc-500 mt-1">
                    {isBatterySaver ? 'Active (Throttled)' : 'Full Performance'}
                  </div>
                </div>
              </button>
            </section>

            {/* Expandable Wi-Fi Selector Tray */}
            <AnimatePresence>
              {isWifiListOpen && isWifiOn && (
                <motion.section
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-white/[0.01] border border-white/5 rounded-2xl p-3 mb-5 space-y-2 animate-none"
                >
                  <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1 mb-1 flex items-center justify-between">
                    <span>Available Networks</span>
                    {connectingSSID && <RefreshCw size={8} className="animate-spin text-indigo-400" />}
                  </div>
                  <div className="space-y-1.5">
                    {WIFI_NETWORKS.map((net) => {
                      const isConnected = currentWifiSSID === net.ssid;
                      const isConnecting = connectingSSID === net.ssid;
                      return (
                        <button
                          key={net.ssid}
                          onClick={() => handleConnectWifi(net.ssid)}
                          disabled={connectingSSID !== null}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all text-xs
                            ${isConnected 
                              ? 'bg-indigo-500/10 border-indigo-500/20 text-white font-bold' 
                              : 'bg-white/[0.01] border-transparent text-zinc-400 hover:bg-white/5'}`}
                        >
                          <div className="flex items-center gap-2">
                            <Wifi size={12} className={isConnected ? 'text-indigo-400' : 'text-zinc-500'} />
                            <span>{net.ssid}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[9px] text-zinc-500">
                            <span>{net.security}</span>
                            {isConnecting ? (
                              <RefreshCw size={10} className="animate-spin text-indigo-400" />
                            ) : isConnected ? (
                              <Check size={10} className="text-indigo-400" />
                            ) : null}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Audio Profile Selector (Segment Panel) */}
            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-3 mb-5">
              <div className="text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1 mb-2">Sound Profile</div>
              <div className="grid grid-cols-3 gap-1 bg-[#050508] p-1 rounded-xl">
                {[
                  { value: 'sound', label: 'Sound', icon: Volume2 },
                  { value: 'vibrate', label: 'Vibrate', icon: Smartphone },
                  { value: 'mute', label: 'Mute', icon: VolumeX }
                ].map((profile) => {
                  const isActive = soundMode === profile.value;
                  return (
                    <button
                      key={profile.value}
                      onClick={() => handleSoundModeChange(profile.value as SoundMode)}
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg col-span-1 text-[10px] font-bold uppercase tracking-wider transition-all
                        ${isActive 
                          ? 'bg-white/10 text-white' 
                          : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}`}
                    >
                      <profile.icon size={12} />
                      <span>{profile.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Slider Module (Brightness Setup) */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 mb-5 space-y-2.5">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Sun size={12} className="text-zinc-400" /> Brightness Scale
                </span>
                <span className="font-mono">{brightness}%</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="flex-1 accent-indigo-500 h-1 bg-white/10 rounded-full cursor-pointer overflow-hidden leading-none appearance-none"
                  style={{
                    background: `linear-gradient(to right, rgb(99,102,241) 0%, rgb(99,102,241) ${brightness}%, rgba(255,255,255,0.1) ${brightness}%, rgba(255,255,255,0.1) 100%)`
                  }}
                />
              </div>
              {isBatterySaver && (
                <div className="text-[9px] font-bold text-amber-500/80 flex items-center gap-1">
                  <AlertTriangle size={10} /> Eco-cap restricts max screen emission to save battery cells
                </div>
              )}
            </div>

            {/* Battery Diagnostics Suite */}
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Battery Diagnostics</div>
                <div className="text-xs font-mono font-bold text-white">{Math.round(batteryLevel)}%</div>
              </div>
              
              {!runDiagnostic ? (
                <button
                  onClick={startLocalDiagnostic}
                  className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/10 hover:border-indigo-500/20 text-[9px] uppercase tracking-wider rounded-xl transition-all"
                >
                  Run Cell Optimization
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden relative">
                    <motion.div 
                      className="absolute left-0 top-0 h-full bg-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${diagnosticProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  {diagnosticReport ? (
                    <div className="text-[10px] text-zinc-400 font-medium whitespace-pre-line leading-relaxed font-mono mt-1 border-t border-white/5 pt-2">
                      {diagnosticReport}
                    </div>
                  ) : (
                    <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest text-center animate-pulse">
                      Analyzing Core Cells...
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
