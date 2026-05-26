import React from 'react';
import {motion} from 'motion/react';
import * as LucideIcons from 'lucide-react';
import {APPS} from '../constants';
import {AppId} from '../types';
import {pushNotification} from './NotificationSystem';
import {playSound} from '../lib/audio';

interface TaskbarProps {
  activeApp: AppId | null;
  openApps: AppId[];
  onAppClick: (id: AppId) => void;
  onLauncherClick: () => void;
  time: Date;
  isMenuOpen: boolean;
  onSetMenuOpen: (open: boolean) => void;
  
  // Quick Settings props
  isWifiOn: boolean;
  currentWifiSSID: string;
  soundMode: 'sound' | 'vibrate' | 'mute';
  isBatterySaver: boolean;
  batteryLevel: number;
  onQuickSettingsClick: () => void;
}

export default function Taskbar({
  activeApp, 
  openApps, 
  onAppClick, 
  onLauncherClick, 
  time, 
  isMenuOpen, 
  onSetMenuOpen,
  isWifiOn,
  currentWifiSSID,
  soundMode,
  isBatterySaver,
  batteryLevel,
  onQuickSettingsClick
}: TaskbarProps) {
  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const isLowPower = batteryLevel < 20;

  // Sound Icon selector
  const renderSoundIcon = () => {
    switch (soundMode) {
      case 'mute':
        return <LucideIcons.VolumeX size={13} className="text-rose-500" />;
      case 'vibrate':
        return <LucideIcons.Smartphone size={13} className="text-amber-500 animate-pulse" />;
      default:
        return <LucideIcons.Volume2 size={13} className="text-indigo-400" />;
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
      {/* Command Node */}
      <button 
        onClick={() => { playSound('click'); onLauncherClick(); }}
        className={`w-12 h-12 flex items-center justify-center rounded-[18px] transition-all duration-500 shadow-2xl relative group overflow-hidden
          ${isMenuOpen 
            ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white scale-110 shadow-[0_0_20px_rgba(99,102,241,0.5)]' 
            : 'bg-[#0c0d10]/80 backdrop-blur-3xl border border-white/10 text-zinc-400 hover:text-white hover:border-indigo-500/50 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]'}
        `}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <LucideIcons.Orbit 
          size={22} 
          className={`relative z-10 transition-transform duration-700 ${isMenuOpen ? 'animate-spin-slow' : 'group-hover:rotate-90'}`} 
        />
      </button>

      {/* App Bar */}
      <div className="flex items-center gap-2 bg-[#0c0d10]/60 backdrop-blur-3xl border border-white/10 p-2 rounded-[24px] shadow-2xl ring-1 ring-white/5">
        {APPS.filter(app => {
          const isDownloadable = ['game', 'editor', 'apk_runner', 'pdf_reader'].includes(app.id);
          if (isDownloadable) {
            return openApps.includes(app.id);
          }
          return true;
        }).map((app) => {
          const IconComponent = (LucideIcons as any)[app.icon];
          const isOpen = openApps.includes(app.id);
          const isActive = activeApp === app.id;
          
          return (
            <button
              key={app.id}
              onClick={() => { playSound('click'); onAppClick(app.id); }}
              className="group relative h-10 w-10 flex flex-col items-center justify-center transition-all"
            >
              <div 
                className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-500
                  ${isActive ? `${app.color} scale-110 shadow-lg shadow-indigo-500/20 text-white` : 'text-zinc-500 hover:text-white hover:bg-white/5'}
                `}
              >
                <IconComponent size={18} />
              </div>
              
              {isOpen && (
                <div className={`absolute -bottom-1 h-1 transition-all duration-500 rounded-full
                  ${isActive ? 'w-4 bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]' : 'w-1 bg-zinc-700'}
                `} />
              )}
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-4 px-3 py-1 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {app.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
