import {Shield, Search, Lock, RefreshCw, Home, X, Plus, Ghost, Star, History, ArrowLeft, ArrowRight, Menu, Terminal, Code, Layout, Github, Book, GitGraph as GitFork, Play, WifiOff} from 'lucide-react';
import {useState, MouseEvent, useMemo, useEffect, useRef} from 'react';

interface Tab {
  id: string;
  title: string;
  url: string;
  isPrivate: boolean;
  zoom: number;
  history: string[];
  historyIndex: number;
}

const SUGGESTIONS = [
  {title: 'About Brave', url: 'brave://about', type: 'search'},
  {title: 'Brave Search', url: 'https://search.brave.com', type: 'search'},
  {title: 'GitHub - Sambi OS', url: 'https://github.com/sambi/os', type: 'bookmark'},
  {title: 'Vite Guide', url: 'https://vitejs.dev/guide/', type: 'history'},
  {title: 'React Documentation', url: 'https://react.dev', type: 'bookmark'},
  {title: 'Tailwind CSS', url: 'https://tailwindcss.com', type: 'history'},
  {title: 'AI Studio Build', url: 'https://ai.studio/build', type: 'history'},
  {title: 'DuckDuckGo', url: 'https://duckduckgo.com', type: 'search'},
];

export default function BraveApp({ isOnline = true }: { isOnline?: boolean }) {
  const [tabs, setTabs] = useState<Tab[]>(() => {
    return [{
      id: '1', 
      title: 'New Tab', 
      url: 'https://search.brave.com', 
      isPrivate: false, 
      zoom: 1,
      history: ['https://search.brave.com'],
      historyIndex: 0
    }];
  });

  const [activeTabId, setActiveTabId] = useState('1');

  // Ensure activeTabId always points to an existing tab
  useEffect(() => {
    if (!tabs.some(t => t.id === activeTabId)) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId]);

  const [isShieldActive, setIsShieldActive] = useState(true);
  const [isUrlFocused, setIsUrlFocused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
  const [devToolsTab, setDevToolsTab] = useState<'elements' | 'console' | 'sources'>('elements');
  const [logs, setLogs] = useState<{type: 'info' | 'warn' | 'error', message: string, time: string}[]>([]);
  const addressBarRef = useRef<HTMLInputElement>(null);

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  const [inputVal, setInputVal] = useState(activeTab.url);

  useEffect(() => {
    setInputVal(activeTab.url);
  }, [activeTabId, activeTab.url]);

  const suggestions = useMemo(() => {
    const input = inputVal.toLowerCase();
    if (!input || input === 'https://search.brave.com' || input === 'brave://private' || !isUrlFocused) return [];
    
    return SUGGESTIONS.filter(s => 
      s.title.toLowerCase().includes(input) || s.url.toLowerCase().includes(input)
    ).slice(0, 5);
  }, [inputVal, isUrlFocused]);

  const addTab = (isPrivate = false) => {
    const newId = Math.random().toString(36).substring(7);
    const defaultUrl = isPrivate ? 'brave://private' : 'https://search.brave.com';
    const newTab: Tab = {
      id: newId,
      title: isPrivate ? 'Private Tab' : 'New Tab',
      url: defaultUrl,
      isPrivate,
      zoom: 1,
      history: [defaultUrl],
      historyIndex: 0
    };
    setTabs([...tabs, newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  const updateUrl = (newUrl: string) => {
    setInputVal(newUrl);
    setTabs(tabs.map(t => t.id === activeTabId ? {...t, url: newUrl} : t));
  };

  const commitUrl = (newUrl: string) => {
    setInputVal(newUrl);
    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        const nextHistory = [...(t.history || [t.url])].slice(0, (t.historyIndex ?? 0) + 1);
        if (nextHistory[nextHistory.length - 1] !== newUrl) {
          nextHistory.push(newUrl);
        }
        return {
          ...t,
          url: newUrl,
          history: nextHistory,
          historyIndex: nextHistory.length - 1
        };
      }
      return t;
    }));
  };

  const handleNavigate = (input: string) => {
    let finalUrl = input.trim();
    if (!finalUrl) return;

    // Handle internal pages
    if (finalUrl === 'brave://about' || finalUrl === 'brave://private' || finalUrl === 'brave://newtab' || finalUrl === 'brave://docs') {
       commitUrl(finalUrl);
       return;
    }

    // Check if it's a URL or search query
    const hasProtocol = /^https?:\/\//i.test(finalUrl);
    const hasDot = finalUrl.includes('.') && finalUrl.indexOf('.') < finalUrl.length - 1;
    const isLocalhost = finalUrl.startsWith('localhost') || finalUrl.startsWith('127.0.0.1');

    if (hasProtocol) {
      commitUrl(finalUrl);
    } else if (hasDot || isLocalhost) {
      // It looks like a URL but missing protocol
      commitUrl('https://' + finalUrl);
    } else {
      // It's a search query
      commitUrl(`https://search.brave.com/search?q=${encodeURIComponent(finalUrl)}`);
    }
    
    setIsUrlFocused(false);
    addressBarRef.current?.blur();
  };

  const canGoBack = (activeTab.historyIndex ?? 0) > 0;
  const canGoForward = activeTab.history && (activeTab.historyIndex ?? 0) < activeTab.history.length - 1;

  const goBack = () => {
    if (canGoBack) {
      setTabs(prev => prev.map(t => {
        if (t.id === activeTabId) {
          const nextIdx = (t.historyIndex ?? 0) - 1;
          return {
            ...t,
            url: t.history[nextIdx],
            historyIndex: nextIdx
          };
        }
        return t;
      }));
    }
  };

  const goForward = () => {
    if (canGoForward) {
      setTabs(prev => prev.map(t => {
        if (t.id === activeTabId) {
          const nextIdx = (t.historyIndex ?? 0) + 1;
          return {
            ...t,
            url: t.history[nextIdx],
            historyIndex: nextIdx
          };
        }
        return t;
      }));
    }
  };

  const updateZoom = (delta: number) => {
    setTabs(tabs.map(t => {
      if (t.id === activeTabId) {
        const newZoom = Math.min(Math.max(t.zoom + delta, 0.5), 3);
        return {...t, zoom: newZoom};
      }
      return t;
    }));
  };

  const resetZoom = () => {
    setTabs(tabs.map(t => t.id === activeTabId ? {...t, zoom: 1} : t));
  };

  const selectSuggestion = (url: string) => {
    commitUrl(url);
    setIsUrlFocused(false);
  };

  useEffect(() => {
    if (activeTab.url) {
      const newLog = {
        type: 'info' as const,
        message: `Navigated to ${activeTab.url}`,
        time: new Date().toLocaleTimeString()
      };
      setLogs(prev => [...prev.slice(-19), newLog]);
      
      // Attempt to set a better title based on URL
      let newTitle = 'Brave';
      const url = activeTab.url.toLowerCase();
      if (url.includes('github.com')) newTitle = 'GitHub';
      else if (url.includes('google.com')) newTitle = 'Google';
      else if (url.includes('search.brave.com')) newTitle = 'Brave Search';
      else if (url === 'brave://about') newTitle = 'About Brave';
      else if (url === 'brave://private') newTitle = 'Private Tab';
      else if (url.includes('.')) {
        try {
          const domain = new URL(activeTab.url).hostname.replace('www.', '');
          newTitle = domain.charAt(0).toUpperCase() + domain.slice(1);
        } catch(e) {}
      }
      
      if (activeTab.title !== newTitle) {
        setTabs(prev => prev.map(t => t.id === activeTabId ? {...t, title: newTitle} : t));
      }
    }
  }, [activeTab.url, activeTabId, activeTab.title]);

  const devToolsContent = useMemo(() => {
    const url = activeTab.url.toLowerCase();
    if (devToolsTab === 'elements') {
      return (
        <div className="font-mono text-[10px] p-4 text-zinc-400 leading-relaxed">
          <div className="text-zinc-600">&lt;!DOCTYPE html&gt;</div>
          <div className="text-blue-400">&lt;html <span className="text-orange-300">lang</span>="en"&gt;</div>
          <div className="ml-4">
            <div className="text-blue-400">&lt;head&gt;</div>
            <div className="ml-4 text-blue-400">&lt;title&gt;<span className="text-zinc-200">{activeTab.title}</span>&lt;/title&gt;</div>
            <div className="text-blue-400">&lt;/head&gt;</div>
            <div className="text-blue-400">&lt;body <span className="text-orange-300">class</span>="sambi-os-render"&gt;</div>
            <div className="ml-4">
              <div className="text-zinc-600">&lt;!-- Primary content area --&gt;</div>
              <div className="text-blue-400">&lt;main <span className="text-orange-300">id</span>="root"&gt;</div>
              <div className="ml-4 text-zinc-500 italic">... {url === 'brave://about' ? 'About content' : 'Dynamic page content'} rendered ...</div>
              <div className="text-blue-400">&lt;/main&gt;</div>
            </div>
            <div className="text-blue-400">&lt;/body&gt;</div>
          </div>
          <div className="text-blue-400">&lt;/html&gt;</div>
        </div>
      );
    }
    if (devToolsTab === 'console') {
      return (
        <div className="p-2 font-mono text-[10px]">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2 py-1 border-b border-white/5 hover:bg-white/5 px-2 group">
              <span className="text-zinc-600 shrink-0">{log.time}</span>
              <span className={`grow ${log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-yellow-400' : 'text-zinc-300'}`}>
                {log.message}
              </span>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-2 px-2 text-blue-400">
            <span>&gt;</span>
            <input type="text" className="bg-transparent border-none outline-none grow text-zinc-200" placeholder="Execute JS..." />
          </div>
        </div>
      );
    }
    return (
      <div className="p-4 font-mono text-[10px] text-zinc-500 flex flex-col items-center justify-center h-full opacity-50">
        <Code size={32} className="mb-2" />
        No scripts available for this domain.
      </div>
    );
  }, [devToolsTab, activeTab, logs]);

  return (
    <div className={`flex flex-col h-full transition-colors duration-300 ${activeTab.isPrivate ? 'bg-[#1e142a]' : 'bg-[#1a1c22]'} text-zinc-300 font-sans`}>
      {/* Tab Bar */}
      <div className={`flex items-center gap-1 px-2 pt-2 h-10 ${activeTab.isPrivate ? 'bg-[#150e1d]' : 'bg-[#0c0d10]'}`}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            onClick={() => setActiveTabId(tab.id)}
            className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg border-t border-x cursor-pointer transition-all min-w-[120px] max-w-[180px]
              ${activeTabId === tab.id 
                ? (tab.isPrivate ? 'bg-[#1e142a] border-purple-500/30' : 'bg-[#1a1c22] border-white/10') 
                : 'bg-black/20 border-transparent hover:bg-white/5'
              }
            `}
          >
            {tab.isPrivate ? <Ghost size={12} className="text-purple-400" /> : <Shield size={12} className="text-orange-500" />}
            <span className={`text-[10px] truncate flex-1 font-medium ${activeTabId === tab.id ? 'text-zinc-100' : 'text-zinc-500'}`}>
              {tab.title}
            </span>
            <X 
              size={10} 
              className="opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-sm p-0.5"
              onClick={(e) => closeTab(e, tab.id)}
            />
          </div>
        ))}
        <button 
          onClick={() => addTab(false)}
          className="p-1 hover:bg-white/5 rounded-md text-zinc-500 transition-colors"
          title="New Tab"
        >
          <Plus size={14} />
        </button>
        <button 
          onClick={() => addTab(true)}
          className="p-1 hover:bg-purple-500/20 rounded-md text-purple-400 transition-colors ml-1"
          title="New Private Tab"
        >
          <Ghost size={14} />
        </button>
      </div>

      {/* Toolbar */}
      <div className={`h-12 flex items-center px-4 gap-4 border-b border-white/5 relative z-50 ${activeTab.isPrivate ? 'bg-[#1e142a]/95 backdrop-blur-md' : 'bg-[#252830]/95 backdrop-blur-md'}`}>
        <div className="flex gap-3">
          <button 
            onClick={goBack}
            disabled={!canGoBack}
            className={`p-1.5 rounded-md transition-colors ${canGoBack ? 'text-zinc-200 hover:bg-white/5' : 'text-zinc-600 cursor-not-allowed'}`}
            title="Back"
          >
            <ArrowLeft size={14} />
          </button>
          <button 
            onClick={goForward}
            disabled={!canGoForward}
            className={`p-1.5 rounded-md transition-colors ${canGoForward ? 'text-zinc-200 hover:bg-white/5' : 'text-zinc-600 cursor-not-allowed'}`}
            title="Forward"
          >
            <ArrowRight size={14} />
          </button>
          <button 
            onClick={() => commitUrl(activeTab.url)}
            className="p-1.5 hover:bg-white/5 rounded-md text-zinc-500 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
          <button 
            onClick={() => commitUrl('https://search.brave.com')}
            className="p-1.5 hover:bg-white/5 rounded-md text-zinc-500 hover:text-white transition-colors"
            title="Homepage"
          >
            <Home size={14} />
          </button>
        </div>

        <div className={`flex-1 h-8 bg-black/40 rounded-full flex items-center px-4 gap-3 border shadow-inner transition-all duration-200 group
          ${isUrlFocused 
            ? (activeTab.isPrivate ? 'border-purple-500 ring-4 ring-purple-500/20' : 'border-orange-500 ring-4 ring-orange-500/20') 
            : 'border-white/10 hover:border-white/20'}
        `}>
          <div className="flex items-center gap-2 shrink-0">
            {activeTab.isPrivate ? (
              <div className="w-5 h-5 rounded-full bg-purple-600/20 flex items-center justify-center">
                <Ghost size={12} className="text-purple-400" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-orange-600/20 flex items-center justify-center">
                <Shield size={12} className="text-orange-500" />
              </div>
            )}
            <Lock size={12} className={activeTab.isPrivate ? 'text-purple-400' : 'text-emerald-500'} />
          </div>

          <input 
            ref={addressBarRef}
            type="text" 
            value={inputVal}
            onChange={(e) => updateUrl(e.target.value)}
            onFocus={() => setIsUrlFocused(true)}
            onBlur={() => {
              setTimeout(() => setIsUrlFocused(false), 200);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleNavigate(inputVal);
              }
            }}
            className="flex-1 bg-transparent border-none outline-none text-xs text-zinc-200 font-mono placeholder:text-zinc-600"
            placeholder="Search or enter URL"
          />

          <div className="flex items-center gap-2 shrink-0">
            <Star size={14} className="text-zinc-600 hover:text-yellow-500 cursor-pointer transition-colors" />
            <div 
              onClick={() => setIsShieldActive(!isShieldActive)}
              className={`flex items-center justify-center cursor-pointer p-1 rounded-md transition-all ${isShieldActive ? (activeTab.isPrivate ? 'bg-purple-500/20 text-purple-400' : 'bg-orange-500/20 text-orange-500') : 'text-zinc-600 hover:text-zinc-400'}`}
            >
              <Shield size={16} />
            </div>
          </div>
        </div>

        <div className="flex gap-2 items-center">
           <div className="flex items-center bg-black/20 rounded-lg px-2 py-1 gap-2 border border-white/5 mr-2">
             <button 
               onClick={() => updateZoom(-0.1)}
               className="hover:text-white text-zinc-500 transition-colors"
               title="Zoom Out"
             >
               <Plus size={14} className="rotate-45" />
             </button>
             <button 
               onClick={resetZoom}
               className="text-[10px] font-mono text-zinc-400 hover:text-zinc-100 min-w-[32px] text-center"
               title="Reset Zoom"
             >
               {Math.round(activeTab.zoom * 100)}%
             </button>
             <button 
               onClick={() => updateZoom(0.1)}
               className="hover:text-white text-zinc-500 transition-colors"
               title="Zoom In"
             >
               <Plus size={14} />
             </button>
           </div>
           
           <button 
              onClick={() => setIsDevToolsOpen(!isDevToolsOpen)}
              className={`p-1.5 hover:bg-white/5 rounded-md transition-colors ${isDevToolsOpen ? 'text-orange-500 bg-orange-500/10' : 'text-zinc-500'}`}
              title="Developer Tools"
           >
              <Code size={16} />
           </button>

           <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-1.5 hover:bg-white/5 rounded-md transition-colors ${isMenuOpen ? 'text-white bg-white/10' : 'text-zinc-500'}`}
           >
              <Menu size={16} />
           </button>
           
           {isMenuOpen && (
             <>
               <div className="fixed inset-0 z-[60]" onClick={() => setIsMenuOpen(false)} />
               <div className={`absolute top-full right-4 mt-2 w-48 rounded-xl border border-white/10 shadow-2xl overflow-hidden z-[70] ${activeTab.isPrivate ? 'bg-[#1e142a]' : 'bg-[#252830]'}`}>
                 <div className="p-1.5 flex flex-col gap-0.5">
                   <button 
                     onClick={() => { addTab(false); setIsMenuOpen(false); }}
                     className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-xs text-zinc-300"
                   >
                     <Plus size={14} className="text-zinc-500" />
                     <span>New Tab</span>
                   </button>
                   <button 
                     onClick={() => { addTab(true); setIsMenuOpen(false); }}
                     className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-xs text-zinc-300"
                   >
                     <Ghost size={14} className="text-purple-400" />
                     <span>New Private Tab</span>
                   </button>
                   <div className="h-[1px] bg-white/5 my-1" />
                   <button 
                     onClick={() => { updateUrl('brave://about'); setIsMenuOpen(false); }}
                     className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-xs text-zinc-300"
                   >
                     <Shield size={14} className="text-orange-500" />
                     <span>About Brave</span>
                   </button>
                   <div className="h-[1px] bg-white/5 my-1" />
                   <button 
                     onClick={() => { setIsDevToolsOpen(!isDevToolsOpen); setIsMenuOpen(false); }}
                     className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors text-xs text-zinc-300"
                   >
                     <Terminal size={14} className="text-zinc-500" />
                     <span>Developer Tools</span>
                   </button>
                 </div>
               </div>
             </>
           )}
        </div>

        {/* Autocomplete Dropdown */}
        {suggestions.length > 0 && (
          <div className={`absolute top-full left-4 right-14 mt-1 rounded-xl border border-white/10 shadow-2xl overflow-hidden z-[100] ${activeTab.isPrivate ? 'bg-[#1e142a]' : 'bg-[#252830]'}`}>
            {suggestions.map((s, i) => (
              <div 
                key={i}
                onClick={() => selectSuggestion(s.url)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-none"
              >
                {s.type === 'search' && <Search size={12} className="text-zinc-500" />}
                {s.type === 'bookmark' && <Star size={12} className="text-yellow-500" />}
                {s.type === 'history' && <History size={12} className="text-zinc-500" />}
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-zinc-100">{s.title}</span>
                  <span className="text-[9px] text-zinc-500 truncate">{s.url}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Page Content & DevTools Split */}
      <div className="flex-1 flex overflow-hidden">
        <div 
          className={`flex-1 flex flex-col overflow-hidden bg-gradient-to-b ${activeTab.isPrivate ? 'from-[#1e142a] to-[#120b1a]' : 'from-[#1a1c22] to-[#14151a]'}`}
        >
          <div 
            className="flex-1 w-full origin-top transition-transform duration-200 overflow-auto"
            style={{ transform: `scale(${activeTab.zoom})`, width: `${100 / activeTab.zoom}%`, height: `${100 / activeTab.zoom}%` }}
          >
          {(() => {
            const url = activeTab.url.toLowerCase();
            const isLocal = url.startsWith('brave://') || url.startsWith('about:');
            
            if (!isOnline && !isLocal) {
              return (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#0d0e11] text-[#c9d1d9] animate-in fade-in duration-300">
                  <div className="w-20 h-20 bg-rose-500/10 rounded-[28px] flex items-center justify-center text-rose-500 mb-6 border border-rose-500/20 shadow-2xl">
                    <WifiOff size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No Internet Connection</h3>
                  <p className="text-sm text-zinc-500 max-w-sm mb-8 leading-relaxed">
                    Sambi OS Wi-Fi linkage has been deselected or powered down. Tap the Quick Settings block in the taskbar to connect.
                  </p>
                  <button 
                    onClick={() => {
                      window.dispatchEvent(new Event('TOGGLE_SAMBI_QUICK_SETTINGS'));
                    }}
                    className="px-5 py-2.5 bg-indigo-500 hover:bg-slate-800 border border-indigo-400/20 rounded-xl text-white text-xs font-black uppercase tracking-wider transition-all"
                  >
                    Open Control Hub
                  </button>
                </div>
              );
            }

            const isNewTab = url === 'https://search.brave.com' || url === 'brave://newtab' || !url;
            
            if (isNewTab && !activeTab.isPrivate) {
              return (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
                  <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-orange-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-orange-900/30 mb-8 mx-auto transition-transform hover:scale-105 duration-500 group relative">
                    <Shield size={56} className="text-black group-hover:drop-shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-all" />
                    <div className="absolute inset-0 bg-white/10 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <h2 className="text-4xl font-black mb-2 tracking-tight text-white">Welcome to <span className="text-orange-500">Brave</span></h2>
                  <p className="text-zinc-500 text-sm mb-12 max-w-sm mx-auto">The privacy-first browser for the intelligent web. No trackers, no ads, just speed.</p>
                  
                  <div className="w-full max-w-xl space-y-8">
                    <div className={`flex items-center bg-black/40 border rounded-2xl px-6 py-4 w-full group focus-within:ring-4 transition-all shadow-2xl
                      ${activeTab.isPrivate ? 'border-purple-500/20 ring-purple-500/10' : 'border-white/10 ring-orange-500/10'}
                    `}>
                       <Search size={20} className={activeTab.isPrivate ? 'text-purple-500 mr-4' : 'text-zinc-500 mr-4'} />
                       <input 
                         type="text" 
                         autoFocus
                         placeholder={activeTab.isPrivate ? "Search privately with Brave..." : "Search or enter a URL..."}
                         className="flex-1 bg-transparent border-none outline-none text-base text-zinc-100 placeholder:text-zinc-700"
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             handleNavigate((e.target as HTMLInputElement).value);
                           }
                         }}
                       />
                       <kbd className="hidden md:block text-[10px] bg-white/5 text-zinc-600 px-2 py-1 rounded border border-white/10 font-bold">ENTER</kbd>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { name: 'GitHub', url: 'https://github.com', icon: Github, color: 'bg-[#24292f]' },
                        { name: 'YouTube', url: 'https://youtube.com', icon: Play, color: 'bg-red-600' },
                        { name: 'AI Studio', url: 'https://ai.studio', icon: Code, color: 'bg-indigo-600' },
                        { name: 'Sambi Docs', url: 'brave://docs', icon: Book, color: 'bg-emerald-600' }
                      ].map((site) => (
                        <button 
                          key={site.name}
                          onClick={() => handleNavigate(site.url)}
                          className="flex flex-col items-center gap-4 p-5 bg-white/5 rounded-[32px] border border-white/5 hover:bg-white/10 hover:border-indigo-500/30 transition-all group relative overflow-hidden active:scale-95"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${site.color || 'bg-zinc-800'} transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-xl relative z-10`}>
                            <site.icon size={26} className="text-white" />
                          </div>
                          <span className="text-[10px] font-black text-zinc-500 group-hover:text-white uppercase tracking-[0.2em] relative z-10 transition-colors">{site.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
            
            if (url.includes('google.com/search') || url.includes('search.brave.com/search')) {
              const urlParams = new URLSearchParams(activeTab.url.split('?')[1]);
              const query = urlParams.get('q') || '';
              return (
                <div className="h-full flex flex-col bg-zinc-900 text-zinc-300 font-sans animate-in fade-in duration-300">
                  <div className="border-b border-white/5 p-4 flex items-center gap-6 bg-black/20">
                    <span className="text-xl font-bold text-white shrink-0">Brave <span className="text-orange-500">Search</span></span>
                    <div className="relative max-w-xl grow">
                      <input 
                        type="text" 
                        defaultValue={query} 
                        onKeyDown={(e) => { if (e.key === 'Enter') handleNavigate((e.target as HTMLInputElement).value); }}
                        className="w-full bg-zinc-800 border border-white/10 rounded-full px-6 py-2 text-sm text-white"
                      />
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto p-4 md:p-8">
                    <div className="max-w-2xl space-y-8">
                      <p className="text-xs text-zinc-500">About {Math.floor(Math.random() * 1000000)} results for "{query}"</p>
                      
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="group cursor-pointer">
                          <div className="text-[10px] text-zinc-500 mb-1">https://example.com/result-{i}</div>
                          <h3 className="text-lg text-blue-400 group-hover:underline mb-1">Search result for {query} - Entry {i}</h3>
                          <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                            This is a simulated search result for the phrase "{query}". In a real environment, Brave Search would provide verified, privacy-focused results here.
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            if (url.includes('youtube.com')) {
              return (
                <div className="p-4 md:p-8 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                      <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-white border-b-[4px] border-b-transparent ml-0.5"></div>
                    </div>
                    <span className="text-xl font-bold text-white tracking-tighter">YouTube</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                      <div key={i} className="flex flex-col gap-3 group cursor-pointer" onClick={() => updateUrl(`https://www.youtube.com/watch?v=mock${i}`)}>
                        <div className="aspect-video bg-zinc-800 rounded-xl overflow-hidden relative border border-white/5">
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <div className="absolute bottom-2 right-2 bg-black/80 text-[10px] px-1.5 py-0.5 rounded font-bold text-white">12:{i}4</div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-9 h-9 rounded-full bg-zinc-700 shrink-0"></div>
                          <div className="flex flex-col gap-1">
                            <div className="h-4 bg-zinc-700 rounded w-full group-hover:bg-zinc-600 transition-colors"></div>
                            <div className="h-3 bg-zinc-800 rounded w-2/3"></div>
                            <div className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider font-bold">1.2M views • 2 hours ago</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            if (url.includes('github.com')) {
              return (
                <div className="h-full flex flex-col bg-[#0d1117] text-[#c9d1d9] font-sans animate-in fade-in duration-300 overflow-auto">
                    <div className="bg-[#161b22] border-b border-[#30363d] p-4 flex items-center justify-between sticky top-0 z-10">
                      <div className="flex items-center gap-4">
                        <Github size={24} className="text-white" />
                        <nav className="flex gap-4 text-sm font-semibold text-[#8b949e]">
                          <span className="text-white border-b-2 border-[#f78166] pb-1 cursor-pointer">Repositories</span>
                          <span className="hover:text-white cursor-pointer transition-colors">Projects</span>
                          <span className="hover:text-white cursor-pointer transition-colors">Packages</span>
                          <span className="hover:text-white cursor-pointer transition-colors">Stars</span>
                        </nav>
                      </div>
                      <div className="flex items-center gap-2">
                         <div className="bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1 flex items-center gap-2">
                           <Search size={14} className="text-[#8b949e]" />
                           <input 
                             type="text" 
                             placeholder="Type / to search" 
                             className="bg-transparent border-none outline-none text-xs w-32" 
                             onKeyDown={(e) => { if (e.key === 'Enter') handleNavigate('https://github.com/search?q=' + (e.target as HTMLInputElement).value); }}
                           />
                         </div>
                      </div>
                    </div>
                    <div className="p-8 max-w-5xl mx-auto w-full">
                       <div className="flex items-end justify-between border-b border-[#30363d] pb-8 mb-8 text-left">
                         <div className="flex items-center gap-4">
                           <div className="w-20 h-20 bg-zinc-800 rounded-xl border border-white/10 flex items-center justify-center p-2 overflow-hidden shadow-2xl">
                             <img src="https://api.dicebear.com/7.x/identicon/svg?seed=sambi" className="w-full h-full object-cover rounded-lg" alt="avatar" />
                           </div>
                           <div>
                             <h1 className="text-2xl font-bold text-white">Sambi OS</h1>
                             <p className="text-[#8b949e] max-w-md">Next-generation privacy-first operating system for the intelligent web.</p>
                           </div>
                         </div>
                         <button className="bg-[#21262d] border border-[#f0f6fc1a] px-4 py-2 rounded-lg text-xs font-semibold text-[#c9d1d9] hover:bg-[#30363d] transition-colors">
                            Follow
                         </button>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                         {[1, 2, 3, 4].map(i => (
                           <div key={i} className="p-5 border border-[#30363d] rounded-xl hover:border-[#8b949e] transition-colors bg-[#0d1117]/50 group">
                              <div className="flex items-center gap-2 mb-2">
                                <Book size={14} className="text-[#8b949e]" />
                                <span 
                                  className="text-[#58a6ff] font-bold text-sm cursor-pointer hover:underline"
                                  onClick={() => handleNavigate(`https://github.com/sambi/os-module-${i}`)}
                                >
                                  os-module-{i}
                                </span>
                                <span className="text-[10px] text-[#8b949e] border border-[#30363d] px-1.5 py-0.5 rounded-full uppercase scale-90">Public</span>
                              </div>
                              <p className="text-xs text-[#8b949e] mb-4 line-clamp-2">Authenticated kernel modules for secure cross-origin communication in Sambi environments.</p>
                              <div className="flex items-center gap-4 text-[10px] text-[#8b949e] font-medium">
                                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> TypeScript</div>
                                <div className="flex items-center gap-1 group-hover:text-yellow-500"><Star size={12} /> {Math.floor(Math.random() * 1000)}</div>
                                <div className="flex items-center gap-1 group-hover:text-indigo-400"><GitFork size={12} /> {Math.floor(Math.random() * 100)}</div>
                              </div>
                           </div>
                         ))}
                       </div>
                    </div>
                </div>
              );
            }

          if (url.includes('google.com') || url.includes('search.brave.com')) {
            return (
              <div className="h-full flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
                <h1 className="text-5xl md:text-6xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-red-500 to-yellow-500">Google</h1>
                <div className="w-full max-w-xl flex items-center bg-zinc-800/50 border border-white/10 rounded-full px-6 py-3 shadow-2xl focus-within:ring-4 ring-blue-500/10 transition-all">
                  <Search size={18} className="text-zinc-500 mr-4" />
                  <input type="text" className="bg-transparent border-none outline-none flex-1 text-white" autoFocus />
                </div>
                <div className="flex gap-4 mt-8">
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-md text-xs font-medium transition-colors border border-white/5">Google Search</button>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-md text-xs font-medium transition-colors border border-white/5">I'm Feeling Lucky</button>
                </div>
              </div>
            );
          }

          if (url === 'brave://docs') {
            return (
              <div className="h-full flex flex-col bg-[#0c0d10] text-[#c9d1d9] font-sans animate-in fade-in duration-300 overflow-auto p-4 md:p-8">
                <div className="max-w-3xl mx-auto space-y-8 text-left">
                  <div className="border-b border-white/10 pb-6">
                    <h1 className="text-3xl font-black text-white tracking-tight">Sambi OS Documentation</h1>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">User Manual & System Specs</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Shield size={16} className="text-indigo-400" /> Core Navigation
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Sambi OS operates via the bottom <strong>Taskbar</strong>. Click the <strong>Orbit Menu</strong> to search for system applications or trigger active diagnostic nodes.
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Terminal size={16} className="text-emerald-400" /> Terminal Developer Interface
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Monitor system status with the live CPU and Memory sparklines on the desktop, or open the detailed <strong>Developer tools</strong> embedded right in Brave.
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Ghost size={16} className="text-purple-400" /> Private Tunneling
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Use Brave Private Tabs to browse privately. Integrated shield protection blocks trackers, scripts, and cookies automatically.
                      </p>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Lock size={16} className="text-amber-400" /> Security Safeguards
                      </h3>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Sambi features an automated warning system for low battery below 20%, triggering a critical <strong>Emergency Shutdown Warning</strong> under 15%.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (url === 'brave://about') {
            return (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500 overflow-y-auto">
                 <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-900/40 mb-8 mx-auto">
                   <Shield size={48} className="text-black" />
                 </div>
                 <h2 className="text-3xl font-bold mb-1 text-white">Brave Browser</h2>
                 <p className="text-zinc-500 text-sm mb-6">Version 1.68.0-sambi (Official Build) (64-bit)</p>
                 
                 <div className="w-full max-w-sm space-y-3 bg-white/5 border border-white/5 p-6 rounded-2xl">
                    <div className="flex flex-col gap-1 text-left">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Update Channel</span>
                      <span className="text-xs text-zinc-300">Stable (Sambi-OS-Release)</span>
                    </div>
                    <div className="h-[1px] bg-white/5" />
                    <div className="flex flex-col gap-2 text-left">
                      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Resources</span>
                      <div className="flex flex-col gap-1">
                        <a href="#" className="text-xs text-orange-500 hover:underline">Privacy Policy</a>
                        <a href="#" className="text-xs text-orange-500 hover:underline">Release Notes</a>
                        <a href="#" className="text-xs text-orange-500 hover:underline">Open Source Credits</a>
                      </div>
                    </div>
                 </div>
                 
                 <p className="mt-8 text-[10px] text-zinc-600 max-w-xs">
                   Brave is made possible by the Brave project and other <span className="text-zinc-500 font-medium">open source software</span>.
                 </p>
              </div>
            );
          }

          if (activeTab.isPrivate || url === 'brave://private') {
            return (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
                 <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-800 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/30 mb-6 mx-auto">
                   <Ghost size={40} className="text-white" />
                 </div>
                 <h2 className="text-2xl font-light mb-2 text-purple-100">Private <span className="font-bold">Browsing</span></h2>
                 <p className="text-purple-300/50 text-sm mb-8 text-center max-w-sm">
                   Brave doesn't save your search history, cookies, or site data. Your activity remains private and encrypted.
                 </p>
                 <div className="flex flex-col items-center gap-4 bg-purple-500/5 border border-purple-500/10 p-6 rounded-2xl">
                   <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-widest">
                     <Shield size={14} /> Shields Up
                   </div>
                   <p className="text-[10px] text-purple-300/40 max-w-xs">
                     Trackers and ads are blocked automatically. Fingerprinting protection is set to strict.
                   </p>
                 </div>
              </div>
            );
          }

          if (url.startsWith('http://') || url.startsWith('https://')) {
            return (
              <div className="h-full relative overflow-hidden flex flex-col">
                <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2 text-emerald-500">
                    <Shield size={10} />
                    <span>Attempting to render external content...</span>
                  </div>
                  <div className="text-zinc-500 max-w-[50%] truncate italic">
                    Note: Some sites may block embedding due to security (CSP/X-Frame).
                  </div>
                </div>
                <iframe 
                  src={activeTab.url} 
                  className="flex-1 w-full border-none bg-white font-sans"
                  title="Web Content"
                  referrerPolicy="no-referrer"
                />
              </div>
            );
          }

          return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/20 mb-6 mx-auto transition-transform hover:scale-110 duration-300">
                 <Shield size={40} className="text-black" />
              </div>
              <h2 className="text-2xl font-light mb-2">Welcome to <span className="font-bold">Brave</span></h2>
              <p className="text-zinc-500 text-sm mb-8 text-center max-w-sm">You are now browsing with the most secure, privacy-focused engine on Sambi Linux.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-md">
                <div className="bg-white/5 p-3 md:p-4 rounded-xl border border-white/5 text-center backdrop-blur-sm group hover:border-orange-500/30 transition-all">
                  <div className="text-lg md:text-xl font-mono text-orange-400">1,402</div>
                  <div className="text-[8px] md:text-[9px] uppercase tracking-wider text-zinc-500 mt-1 font-bold">Ads Blocked</div>
                </div>
                <div className="bg-white/5 p-3 md:p-4 rounded-xl border border-white/5 text-center backdrop-blur-sm group hover:border-orange-500/30 transition-all">
                  <div className="text-lg md:text-xl font-mono text-orange-400">{isShieldActive ? '48MB' : '0MB'}</div>
                  <div className="text-[8px] md:text-[9px] uppercase tracking-wider text-zinc-500 mt-1 font-bold">Data Saved</div>
                </div>
                <div className="bg-white/5 p-3 md:p-4 rounded-xl border border-white/5 text-center backdrop-blur-sm group hover:border-orange-500/30 transition-all">
                  <div className="text-lg md:text-xl font-mono text-orange-400">1.2m</div>
                  <div className="text-[8px] md:text-[9px] uppercase tracking-wider text-zinc-500 mt-1 font-bold">Time Saved</div>
                </div>
              </div>

              <div className={`mt-12 flex items-center bg-black/20 border rounded-full px-5 py-2.5 w-full max-w-sm group focus-within:ring-4 transition-all shadow-xl
                ${activeTab.isPrivate ? 'border-purple-500/20 ring-purple-500/10' : 'border-white/10 ring-orange-500/10'}
              `}>
                 <Search size={16} className={activeTab.isPrivate ? 'text-purple-500 mr-3' : 'text-zinc-500 mr-3'} />
                 <input 
                   type="text" 
                   placeholder={activeTab.isPrivate ? "Search privately with Brave..." : "Search and browse privately..."}
                   className="flex-1 bg-transparent outline-none text-xs text-zinc-300"
                   onKeyDown={(e) => {
                     if (e.key === 'Enter') {
                       handleNavigate((e.target as HTMLInputElement).value);
                     }
                   }}
                 />
                 <kbd className="text-[9px] bg-white/5 text-zinc-500 px-1.5 py-0.5 rounded border border-white/10 ml-2">Enter</kbd>
              </div>
            </div>
            );
          })()}
          </div>
        </div>

        {/* Developer Tools Panel */}
        {isDevToolsOpen && (
          <div className="w-[40%] bg-[#1c1e24] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl relative z-40">
            <div className="h-9 flex items-center justify-between border-b border-white/5 px-3 bg-black/20 shrink-0">
              <div className="flex h-full">
                {[
                  {id: 'elements', label: 'Elements', icon: Layout},
                  {id: 'console', label: 'Console', icon: Terminal},
                  {id: 'sources', label: 'Sources', icon: Code}
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setDevToolsTab(t.id as any)}
                    className={`flex items-center gap-2 px-3 h-full text-[10px] uppercase tracking-wider font-bold transition-all border-b-2
                      ${devToolsTab === t.id ? 'border-orange-500 text-zinc-100 bg-white/5' : 'border-transparent text-zinc-500 hover:text-zinc-300'}
                    `}
                  >
                    <t.icon size={12} />
                    {t.label}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setIsDevToolsOpen(false)}
                className="p-1 hover:bg-white/5 rounded text-zinc-500"
              >
                <X size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
              {devToolsContent}
            </div>
            <div className="p-2 border-t border-white/5 bg-black/10 flex items-center justify-between text-[9px] text-zinc-600 font-mono shrink-0">
              <div className="flex gap-4">
                <span>UTF-8</span>
                <span>Line 1, Col 1</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
                <span>Live Rendering</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer statistics bar */}
      <div className={`bg-black/20 py-2 px-4 text-[9px] text-zinc-500 flex justify-between border-t border-white/5 uppercase tracking-widest font-bold`}>
        <div className="flex gap-6">
          <span className="flex items-center gap-2">
            <Lock size={10} className={activeTab.isPrivate ? 'text-purple-400' : 'text-emerald-500'} /> 
            {activeTab.isPrivate ? 'Tor Integrated Connection' : 'Connection Secure'}
          </span>
          <span>{activeTab.isPrivate ? 'Encrypted Tunnel Active' : 'HTTPS only active'}</span>
        </div>
        <div className={activeTab.isPrivate ? 'text-purple-400' : 'text-orange-500'}>
          {activeTab.isPrivate ? 'Sambi Private Relay' : 'Privatized by Sambi OS'}
        </div>
      </div>
    </div>
  );
}
