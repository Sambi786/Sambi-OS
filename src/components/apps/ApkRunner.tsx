import { useState, useEffect } from 'react';
import { 
  Smartphone, Upload, BookOpen, Clock, Signal, Wifi, Battery, Home, 
  Send, Music, Play, Pause, Terminal, ArrowLeft, Download, ShieldCheck
} from 'lucide-react';
import { playSound } from '../../lib/audio';
import { pushNotification } from '../NotificationSystem';

interface APKPackage {
  id: string;
  name: string;
  pckName: string;
  icon: string;
  installed: boolean;
  version: string;
  details: string;
}

export default function ApkRunnerApp() {
  const [apks, setApks] = useState<APKPackage[]>([
    { id: 'whatsapp', name: 'Chatify Desktop', pckName: 'com.chatify.messager', icon: '💬', installed: true, version: '4.2.1', details: 'Sandbox text chat simulator client.' },
    { id: 'spotify', name: 'VibeCloud Music', pckName: 'com.vibecloud.stream', icon: '🎵', installed: false, version: '8.9.22', details: 'Online music streaming player with preloaded sound curves.' },
  ]);

  const [activeScreen, setActiveScreen] = useState<'launcher' | 'whatsapp' | 'spotify' | 'terminal'>('launcher');
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [installProgress, setInstallProgress] = useState(0);
  const [openApkManager, setOpenApkManager] = useState(false);
  
  // Terminal state inside Micro Terminal
  const [termHistory, setTermHistory] = useState<string[]>([
    "Connecting micro sandbox container...",
    "// Device serial ID: S-00234X",
    "// API mounting layers: validated",
    "STATUS: STABLE OPERATIONS",
    "Type 'help' for a list of system commands!"
  ]);
  const [termInput, setTermInput] = useState('');

  const submitTerminal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termInput.trim()) return;
    playSound('click');
    const cmd = termInput.trim();
    const nextHistory = [...termHistory, `$ ${cmd}`];
    
    let reply = '';
    const cleanCmd = cmd.toLowerCase();
    if (cleanCmd === 'help') {
      reply = "Available commands: help, status, install, apps, inspect <app_id>, clear";
    } else if (cleanCmd === 'status') {
      reply = "Sambi Droid Subsystem: STABLE\nAPI Layer: API 28\nCPU usage: 1.25%\nMemory: OK";
    } else if (cleanCmd === 'apps') {
      reply = "Installed APK Packages:\n" + apks.map(a => `- ${a.name} (${a.pckName}) [${a.installed ? 'Mounted' : 'Unmounted'}]`).join('\n');
    } else if (cleanCmd.startsWith('inspect ')) {
      const target = cleanCmd.substring(8).trim();
      const apk = apks.find(a => a.id.includes(target) || a.name.toLowerCase().includes(target));
      if (apk) {
        reply = `NAME: ${apk.name}\nPACKAGE: ${apk.pckName}\nVERSION: ${apk.version}\nMOUNTED: ${apk.installed}\nDETAILS: ${apk.details}`;
      } else {
        reply = `Could not find any package matching "${target}".`;
      }
    } else if (cleanCmd === 'clear') {
      setTermHistory([]);
      setTermInput('');
      return;
    } else if (cleanCmd === 'install') {
      reply = "Usage: inspect <apk_id> or slide sidebars for package bindings.";
    } else {
      reply = `bash: ${cmd}: command not found. Type 'help' to see diagnostic command options.`;
    }

    setTermHistory([...nextHistory, reply]);
    setTermInput('');
  };
  
  // Chat state inside Chatify
  const [messages, setMessages] = useState<{sender: 'me'|'bot', text: string}[]>([
    { sender: 'bot', text: 'Sambi Android Engine synchronized successfully!' },
    { sender: 'bot', text: 'Welcome to Chatify. Type any trace command here...' }
  ]);
  const [inputText, setInputText] = useState('');

  // Music state inside Spotify
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [activeSong, setActiveSong] = useState('Pixel Sunrise (Retro Synth Mix)');

  const handleCustomApkUpload = (file: File) => {
    playSound('click');
    const nameWithoutExt = file.name.split('.').slice(0, -1).join('.') || file.name;
    const cleanPackage = 'com.custom.' + nameWithoutExt.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Add custom APK
    const newApk: APKPackage = {
      id: cleanPackage,
      name: nameWithoutExt,
      pckName: cleanPackage,
      icon: '📦',
      installed: false,
      version: '1.0.0-custom',
      details: `Custom uploaded file package '${file.name}'. Ready for simulated local sandbox execution.`
    };

    setApks(prev => {
      if (prev.some(a => a.id === cleanPackage)) {
        pushNotification('Already Loaded', `"${nameWithoutExt}" is already registered!`, 'warning');
        return prev;
      }
      pushNotification('Package Loaded', `Loaded Custom APK code for "${nameWithoutExt}"! Click Mount or Launch.`, 'success');
      return [...prev, newApk];
    });
  };

  const handleInstallAPK = (id: string) => {
    if (installingId) return;
    playSound('click');
    setInstallingId(id);
    setInstallProgress(0);

    const interval = setInterval(() => {
      setInstallProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setInstallingId(null);
          setApks(prev => prev.map(a => a.id === id ? { ...a, installed: true } : a));
          playSound('notification');
          pushNotification('APK Installed', `"${apks.find(a => a.id === id)?.name}" registered into Sambi Droid.`, 'success');
          return 100;
        }
        return p + 10;
      });
    }, 150);
  };

  const handleUninstallAPK = (id: string) => {
    playSound('click');
    setApks(prev => prev.map(a => a.id === id ? { ...a, installed: false } : a));
    if (activeScreen === id) setActiveScreen('launcher');
    pushNotification('APK Uninstalled', 'Package cleanly removed.', 'warning');
  };

  const submitChat = () => {
    if (!inputText.trim()) return;
    playSound('click');
    const userMsg = inputText.trim();
    setMessages(prev => [...prev, { sender: 'me', text: userMsg }]);
    setInputText('');

    setTimeout(() => {
      const bots = [
        "Processing micro request...",
        "Cryptographic keys validated. All ports secure.",
        "Sambi kernel optimization triggered.",
        "That sounds fascinating! Have you checked terminal logs?",
        "Ecosystem synchronized successfully."
      ];
      setMessages(prev => [...prev, { sender: 'bot', text: bots[Math.floor(Math.random()*bots.length)] }]);
      playSound('notification');
    }, 1000);
  };

  return (
    <div className="h-full w-full bg-[#050608] text-white flex font-sans overflow-hidden">
      
      {/* Sidebar - APK Management and Manual Installer */}
      <aside className="w-80 border-r border-white/5 bg-[#090b10] flex flex-col justify-between overflow-y-auto no-scrollbar">
        <div className="p-6 space-y-8">
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Android Subsystem</h3>
            <p className="text-xs leading-relaxed text-zinc-500">
              Run compatible simulated APK sandboxes inside Sambi Core OS workspace. Easy drag-and-drop or bundle installing.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#4d5267]">Subsystem Details</h4>
            <div className="space-y-1.5 text-xs font-semibold text-zinc-400">
              <div className="flex justify-between">
                <span>Core VM Engine</span>
                <span className="text-emerald-400">Active Stage</span>
              </div>
              <div className="flex justify-between">
                <span>Kernel Parity API</span>
                <span>Active 28</span>
              </div>
              <div className="flex justify-between">
                <span>Signature Check</span>
                <span className="text-indigo-400 flex items-center gap-1"><ShieldCheck size={11} /> Sandbox</span>
              </div>
            </div>
          </div>

          {/* APK Installer Panel */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Available System APKs</h3>
            
            <div className="space-y-3">
              {apks.map((apk) => (
                <div key={apk.id} className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl select-none">{apk.icon}</span>
                      <div>
                        <h4 className="text-xs font-black">{apk.name}</h4>
                        <span className="text-[9px] font-mono font-bold text-zinc-600 block">{apk.pckName}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-white/5 rounded text-zinc-500 text-xs font-bold leading-none">{apk.version}</span>
                  </div>

                  <p className="text-[11px] font-semibold leading-relaxed text-zinc-500">{apk.details}</p>

                  <div className="flex items-center gap-2">
                    {apk.installed ? (
                      <>
                        <span className="text-[10px] font-black text-zinc-500 mr-auto uppercase flex items-center gap-1">
                          ✓ Installed
                        </span>
                        <button 
                          onClick={() => handleUninstallAPK(apk.id)}
                          className="px-3 py-1.5 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 font-bold hover:bg-rose-500/5 transition-all rounded-lg text-xs"
                        >
                          Delete
                        </button>
                      </>
                    ) : installingId === apk.id ? (
                      <div className="w-full space-y-1.5">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-wider text-indigo-400">
                          <span>Registering binaries...</span>
                          <span>{installProgress}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 transition-all duration-150" style={{ width: `${installProgress}%` }} />
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleInstallAPK(apk.id)}
                        className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 font-black tracking-wider uppercase rounded-xl text-[10px] text-white transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-500/10"
                      >
                        <Download size={11} /> Mount APK Package
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Drag Zone mock */}
        <div 
          onClick={() => document.getElementById('apk-file-input')?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) {
              handleCustomApkUpload(file);
            }
          }}
          className="p-6 border-t border-white/5 bg-black/20 m-4 rounded-[24px] border border-dashed border-white/10 hover:border-indigo-500/30 transition-all text-center flex flex-col items-center gap-2 py-8 cursor-pointer group"
        >
          <input 
            id="apk-file-input"
            type="file"
            className="hidden"
            accept=".apk,.json,.txt"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleCustomApkUpload(file);
              }
            }}
          />
          <Upload size={22} className="text-zinc-400 group-hover:text-indigo-400 transition-colors" />
          <h4 className="text-xs font-black uppercase text-zinc-300">Load custom APK</h4>
          <p className="text-[10px] text-zinc-500 leading-relaxed max-w-[180px]">Drag raw android binaries directly here or click to auto-mount sandbox.</p>
        </div>
      </aside>

      {/* Main active zone - The Smartphone Mock Container */}
      <section className="flex-1 p-8 flex items-center justify-center relative bg-[#06070a]">
        
        {/* The Phone frame */}
        <div className="w-[340px] h-[640px] bg-[#0c0d12] border-8 border-[#1a1c24] rounded-[52px] shadow-3xl flex flex-col overflow-hidden relative ring-1 ring-white/5">
          {/* Top Notch Dynamic Island */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-50 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-850 absolute right-4" />
          </div>

          {/* Phone Status Bar */}
          <header className="h-10 px-6 pt-2 select-none flex items-center justify-between text-zinc-400 text-[10px] font-mono font-black z-45">
            <span>09:41</span>
            <div className="flex items-center gap-1.5 text-zinc-500">
              <Signal size={10} className="text-indigo-400" />
              <Wifi size={10} className="text-indigo-400" />
              <Battery size={13} className="text-indigo-400 animate-pulse" />
            </div>
          </header>

          {/* Active Screen Viewport */}
          <div className="flex-1 overflow-hidden relative bg-[#050508]">
            
            {/* View 1: Home Launcher */}
            {activeScreen === 'launcher' && (
              <div className="h-full w-full p-6 flex flex-col justify-between relative">
                
                {/* Apps Grid */}
                <div className="space-y-6 pt-4">
                  <div className="text-[9px] font-black tracking-[0.2em] uppercase text-zinc-500">Android Applications</div>
                  
                  <div className="grid grid-cols-3 gap-y-6">
                    {apks.filter(a => a.installed).map((app) => (
                      <button
                        key={app.id}
                        onClick={() => { playSound('click'); setActiveScreen(app.id as any); }}
                        className="flex flex-col items-center gap-2.5 group"
                      >
                        <div className="w-14 h-14 bg-white/5 border border-white/10 group-hover:border-indigo-500 group-hover:scale-105 active:scale-95 transition-all rounded-[20px] shadow-lg flex items-center justify-center text-3xl select-none">
                          {app.icon}
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 group-hover:text-white truncate max-w-[80px] text-center">{app.name}</span>
                      </button>
                    ))}
                    
                    {apks.filter(a => a.installed).length === 0 && (
                      <div className="col-span-3 text-center py-12 text-zinc-650 text-[10px] font-bold">
                        No APK applications installed. Launch the side panels to download Chatify or VibeCloud APK blocks.
                      </div>
                    )}
                  </div>
                </div>

                {/* Subsystem system check overlay */}
                <div className="bg-white/[0.01] border border-white/5 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Subsystem Active • No Threats</span>
                </div>
              </div>
            )}

            {/* View 2: WHATSAPP (Chatify Client) */}
            {activeScreen === 'whatsapp' && (
              <div className="h-full w-full flex flex-col bg-[#07080a]">
                {/* Header info */}
                <div className="h-12 border-b border-white/5 px-4 bg-[#0a0c10] flex items-center gap-2">
                  <button onClick={() => setActiveScreen('launcher')} className="text-zinc-500 hover:text-white transition-all">
                    <ArrowLeft size={16} />
                  </button>
                  <span className="text-2xl select-none">💬</span>
                  <div>
                    <h4 className="text-[11px] font-black text-white">Chatify Sandbox</h4>
                    <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest block leading-none">secure link</span>
                  </div>
                </div>

                {/* Messages pane */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                  {messages.map((m, i) => (
                    <div 
                      key={i} 
                      className={`max-w-[80%] p-3 rounded-2xl text-[11px] font-semibold leading-relaxed
                        ${m.sender === 'me' 
                          ? 'ml-auto bg-indigo-600 text-white rounded-br-sm' 
                          : 'bg-white/5 text-zinc-300 rounded-bl-sm border border-white/5'}`}
                    >
                      {m.text}
                    </div>
                  ))}
                </div>

                {/* Keyboard submit block */}
                <div className="p-3 border-t border-white/5 bg-black/25 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type sandbox packet..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitChat()}
                    className="flex-1 bg-white/5 border border-white/5 rounded-xl px-3 text-xs outline-none focus:border-indigo-500/50"
                  />
                  <button onClick={submitChat} className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center text-white hover:bg-indigo-650 transition-colors">
                    <Send size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* View 3: SPOTIFY (VibeCloud Streamer) */}
            {activeScreen === 'spotify' && (
              <div className="h-full w-full flex flex-col justify-between bg-[#07080a] p-6 text-center">
                {/* Header */}
                <div className="flex justify-between items-center text-zinc-500">
                  <button onClick={() => setActiveScreen('launcher')}>
                    <ArrowLeft size={16} />
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-wider">VibeCloud Player</span>
                  <span className="w-4 h-4" /> {/* spacer */}
                </div>

                {/* Album Art Core */}
                <div className="my-auto space-y-6">
                  <div className="w-36 h-36 bg-gradient-to-tr from-lime-600 to-green-500 rounded-[32px] mx-auto shadow-2xl flex items-center justify-center relative overflow-hidden group">
                    <Music size={44} className="text-white group-hover:scale-110 transition-transform duration-500" />
                    {isMusicPlaying && (
                      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="w-1 bg-white rounded-full animate-pulse" style={{ height: `${Math.floor(Math.random() * 15) + 5}px` }} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5 px-4">
                    <h3 className="text-xs font-black truncate text-white">{activeSong}</h3>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Sambi Subspace Audio Stream</p>
                  </div>
                </div>

                {/* Stream Controls */}
                <div className="space-y-4">
                  {/* Slider Progress */}
                  <div className="space-y-1.5">
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full bg-lime-500 ${isMusicPlaying ? 'w-2/3 animate-pulse' : 'w-1/3'}`} />
                    </div>
                    <div className="flex justify-between text-[8px] font-mono text-zinc-650">
                      <span>01:14</span>
                      <span>03:40</span>
                    </div>
                  </div>

                  {/* Play controls */}
                  <div className="flex justify-center items-center gap-6 pb-4">
                    <button 
                      onClick={() => { playSound('click'); setIsMusicPlaying(!isMusicPlaying); }}
                      className="w-14 h-14 bg-lime-500 text-black hover:scale-105 active:scale-95 transition-all rounded-full flex items-center justify-center shadow-xl shadow-lime-500/10"
                    >
                      {isMusicPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* View 4: MICRO TERMINAL */}
            {activeScreen === 'terminal' && (
              <div className="h-full w-full flex flex-col bg-[#050508] font-mono p-4 text-[10px] leading-relaxed select-text">
                <div className="flex justify-between items-center text-zinc-500 border-b border-white/5 pb-2 mb-2 select-none">
                  <button onClick={() => { playSound('click'); setActiveScreen('launcher'); }} className="text-zinc-500 hover:text-white transition-all">
                    <ArrowLeft size={14} />
                  </button>
                  <span className="text-[9px]">com.android.terminal</span>
                  <span className="w-4 h-4" />
                </div>

                {/* History screen */}
                <div className="flex-1 overflow-y-auto space-y-1.5 no-scrollbar mb-2 text-[#00ffcc]">
                  <p className="text-zinc-500">// Sambi Terminal v1.0.5</p>
                  <p className="text-zinc-500">// Root terminal emulator container active.</p>
                  <br />
                  {termHistory.map((line, i) => (
                    <div key={i} className="whitespace-pre-wrap">
                      {line.startsWith('$') ? (
                        <span className="text-white font-bold">{line}</span>
                      ) : line.includes('com.custom') || line.includes('com.apple') || line.includes('com.chatify') ? (
                        <span className="text-indigo-400 font-bold">{line}</span>
                      ) : line.includes('not found') ? (
                        <span className="text-rose-400">{line}</span>
                      ) : line.includes('STATUS: STABLE') || line.includes('STABLE') || line.includes('active') || line.includes('OK') ? (
                        <span className="text-emerald-400">{line}</span>
                      ) : (
                        <span className="text-zinc-400">{line}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Input Prompt */}
                <form onSubmit={submitTerminal} className="border-t border-white/5 pt-2 flex items-center gap-1.5 select-none">
                  <span className="text-white font-bold shrink-0">$</span>
                  <input 
                    type="text"
                    value={termInput}
                    onChange={(e) => setTermInput(e.target.value)}
                    placeholder="Type 'help'..."
                    className="flex-1 bg-transparent border-none outline-none text-[#00ffcc] text-[10px] font-mono placeholder:text-zinc-700"
                  />
                </form>
              </div>
            )}
          </div>

          {/* Phone Bottom Home Bar */}
          <footer className="h-12 bg-[#0c0d12] flex items-center justify-center select-none">
            <button 
              onClick={() => { playSound('click'); setActiveScreen('launcher'); }}
              className="w-24 h-5 hover:bg-white/5 rounded-2xl flex items-center justify-center group"
            >
              <div className="w-12 h-1 bg-zinc-600 group-hover:bg-white rounded-full transition-colors" />
            </button>
          </footer>
        </div>
      </section>

    </div>
  );
}
