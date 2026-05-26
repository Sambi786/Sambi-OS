import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { WALLPAPERS } from '../../constants';
import { pushNotification } from '../NotificationSystem';
import { playSound } from '../../lib/audio';
import { 
  Globe, ChevronDown, Activity, Sliders, Shield, ShieldCheck, 
  Cpu, Server, Network, Wifi, RefreshCw, Send, HardDrive, AlertTriangle, Play, Pause
} from 'lucide-react';

interface SettingsProps {
  currentWallpaper: string;
  onWallpaperChange: (url: string) => void;
}

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'fr', name: 'French', native: 'Français' }
];

// Graph Nodes & Links interface matching simulation
interface NetworkNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'core' | 'service' | 'external' | 'database';
  status: 'active' | 'warning' | 'idle';
  trafficRate: number; // kbps
  ip: string;
  port: number;
  protocol: 'Stealth-TCP' | 'WireGuard' | 'HTTPS-Tunnel' | 'WebSocket';
}

interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  source: string | NetworkNode;
  target: string | NetworkNode;
  value: number;
  activeTraffic: boolean;
}

interface TrafficParticle {
  id: string;
  link: NetworkLink;
  progress: number;
  speed: number;
}

export default function SettingsApp({ currentWallpaper, onWallpaperChange }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'system' | 'network'>('system');
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('sambi_language') || 'en';
  });
  const [isStealthOn, setIsStealthOn] = useState(true);

  // Network State
  const [nodes, setNodes] = useState<NetworkNode[]>([
    { id: 'sambi_core', label: 'Sambi Core Node', type: 'core', status: 'active', trafficRate: 350, ip: '127.0.0.1', port: 3000, protocol: 'Stealth-TCP' },
    { id: 'brave_browser', label: 'Brave Sandbox', type: 'service', status: 'active', trafficRate: 140, ip: '10.0.2.15', port: 8080, protocol: 'HTTPS-Tunnel' },
    { id: 'app_store', label: 'Sambi Store Hub', type: 'service', status: 'active', trafficRate: 45, ip: '10.0.2.22', port: 443, protocol: 'HTTPS-Tunnel' },
    { id: 'encryption_proxy', label: 'AESSecure-Proxy', type: 'database', status: 'active', trafficRate: 190, ip: '192.168.12.1', port: 9001, protocol: 'WireGuard' },
    { id: 'cloud_sync', label: 'Cloud Gateway', type: 'external', status: 'idle', trafficRate: 0, ip: '185.122.88.4', port: 10443, protocol: 'WebSocket' },
    { id: 'stealth_vpn', label: 'Stealth-VPN', type: 'external', status: 'warning', trafficRate: 12, ip: '92.222.41.9', port: 1194, protocol: 'WireGuard' }
  ]);

  const [links, setLinks] = useState<NetworkLink[]>([
    { source: 'sambi_core', target: 'brave_browser', value: 3, activeTraffic: true },
    { source: 'sambi_core', target: 'app_store', value: 2, activeTraffic: true },
    { source: 'sambi_core', target: 'encryption_proxy', value: 4, activeTraffic: true },
    { source: 'encryption_proxy', target: 'stealth_vpn', value: 2, activeTraffic: true },
    { source: 'encryption_proxy', target: 'cloud_sync', value: 1, activeTraffic: false }
  ]);

  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [isThrottling, setIsThrottling] = useState(false);
  const [trafficInjections, setTrafficInjections] = useState(0);

  // Live fluctuating traffic speeds for display metrics
  const [downloadRate, setDownloadRate] = useState(482.4);
  const [uploadRate, setUploadRate] = useState(128.8);
  const [latency, setLatency] = useState(14);

  const handleLanguageChange = (code: string) => {
    setCurrentLanguage(code);
    localStorage.setItem('sambi_language', code);
    const lang = LANGUAGES.find(l => l.code === code);
    pushNotification('Language Updated', `System language set to ${lang?.name}. Real-time parity maintained.`, 'success');
  };

  const handleStealthToggle = () => {
    playSound('click');
    setIsStealthOn(!isStealthOn);
    pushNotification(
      'Stealth Module Settings',
      isStealthOn ? 'Advanced Stealth Mode deactivated. Connection headers visible.' : 'Stealth Mode activated. Deep encryption active.',
      isStealthOn ? 'warning' : 'success'
    );
  };

  // Periodic network fluctuations
  useEffect(() => {
    const timer = setInterval(() => {
      setDownloadRate(prev => {
        const diff = (Math.random() - 0.5) * 20;
        const target = isThrottling ? 84 : 480;
        const next = Math.max(10, prev + diff);
        // Slowly ease to target if throttled
        return Math.round((next * 0.9 + target * 0.1) * 10) / 10;
      });

      setUploadRate(prev => {
        const diff = (Math.random() - 0.5) * 8;
        const target = isThrottling ? 22 : 130;
        const next = Math.max(5, prev + diff);
        return Math.round((next * 0.9 + target * 0.1) * 10) / 10;
      });

      setLatency(prev => {
        const offset = Math.random() > 0.85 ? (Math.random() > 0.5 ? 4 : -4) : 0;
        const base = isStealthOn ? 18 : 11;
        const actualBase = isThrottling ? base + 24 : base;
        return Math.max(5, Math.round(actualBase + offset));
      });
    }, 1500);

    return () => clearInterval(timer);
  }, [isThrottling, isStealthOn]);

  // Handle Injecting Packet Wave
  const handleInjectPacket = () => {
    playSound('notification');
    setTrafficInjections(prev => prev + 1);
    pushNotification('Packets Injected', 'Triggered high-volume packet trace waves. Spawning interactive nodes burst.', 'success');
    window.dispatchEvent(new CustomEvent('sambi_vibrate'));
    
    // Temporarily trigger traffic surge
    setDownloadRate(prev => prev + 180);
    setUploadRate(prev => prev + 65);
  };

  const handleToggleThrottle = () => {
    playSound('click');
    setIsThrottling(!isThrottling);
    pushNotification(
      'Traffic Shaper Settings',
      !isThrottling ? 'Coarse-grain bandwidth throttle activated. Capping nodes at lower rates.' : 'Bandwidth throttle cleared. Maximum capacity restored.',
      !isThrottling ? 'warning' : 'success'
    );
  };

  // D3 forces ref & render loop
  const svgRef = useRef<SVGSVGElement | null>(null);
  const simulationRef = useRef<d3.Simulation<NetworkNode, undefined> | null>(null);

  useEffect(() => {
    if (activeTab !== 'network' || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = svgRef.current.getBoundingClientRect().width || 420;
    const height = svgRef.current.getBoundingClientRect().height || 340;

    // Reset clean canvas content
    svg.selectAll('*').remove();

    // Create container groups
    const gLinks = svg.append('g').attr('class', 'links-group');
    const gParticles = svg.append('g').attr('class', 'particles-group');
    const gNodes = svg.append('g').attr('class', 'nodes-group');

    // Create visual nodes and link deep copies to avoid modifying state arrays directly
    const simNodes: NetworkNode[] = JSON.parse(JSON.stringify(nodes));
    const simLinks: NetworkLink[] = JSON.parse(JSON.stringify(links)).map((l: any) => ({
      ...l,
      source: simNodes.find(n => n.id === l.source) || l.source,
      target: simNodes.find(n => n.id === l.target) || l.target
    }));

    // Setup Force Simulation
    const simulation = d3.forceSimulation<NetworkNode>(simNodes)
      .force('link', d3.forceLink<NetworkNode, NetworkLink>(simLinks)
        .id(d => d.id)
        .distance(95)
      )
      .force('charge', d3.forceManyBody().strength(-180))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius(32).strength(0.8));

    simulationRef.current = simulation;

    // Create the links
    const linkItems = gLinks.selectAll<SVGLineElement, NetworkLink>('line')
      .data(simLinks)
      .enter()
      .append('line')
      .attr('stroke', '#1e293b') // slate border-900 / white-5
      .attr('stroke-width', d => d.value)
      .attr('stroke-dasharray', d => d.activeTraffic ? '3,3' : 'none')
      .style('opacity', 0.65);

    // Initial Continuous Particles along active links
    const activeParticles: TrafficParticle[] = [];
    simLinks.forEach((l, idx) => {
      if (l.activeTraffic) {
        // Spawn 2-3 particles spaced out per link
        activeParticles.push({
          id: `p-${idx}-a`,
          link: l,
          progress: 0.1,
          speed: 0.012 + Math.random() * 0.008
        });
        activeParticles.push({
          id: `p-${idx}-b`,
          link: l,
          progress: 0.5,
          speed: 0.012 + Math.random() * 0.008
        });
      }
    });

    // Spawn extra temporary packets if trafficInjections changed
    if (trafficInjections > 0) {
      simLinks.forEach((l, idx) => {
        for (let i = 0; i < 4; i++) {
          activeParticles.push({
            id: `p-surge-${idx}-${i}-${Date.now()}`,
            link: l,
            progress: Math.random(),
            speed: 0.025 + Math.random() * 0.015
          });
        }
      });
    }

    const particleSelection = gParticles.selectAll<SVGCircleElement, TrafficParticle>('circle')
      .data(activeParticles)
      .enter()
      .append('circle')
      .attr('r', 3)
      .attr('fill', isThrottling ? '#f59e0b' : '#818cf8') // orange or indigo
      .style('filter', 'drop-shadow(0 0 4px currentColor)');

    // Create the nodes groups
    const nodeContainers = gNodes.selectAll<SVGGElement, NetworkNode>('g')
      .data(simNodes)
      .enter()
      .append('g')
      .attr('class', 'node-item')
      .style('cursor', 'pointer')
      .call(
        d3.drag<SVGGElement, NetworkNode>()
          .on('start', (e, d) => {
            if (!e.active) simulation.alphaTarget(0.2).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (e, d) => {
            d.fx = e.x;
            d.fy = e.y;
          })
          .on('end', (e, d) => {
            if (!e.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }) as any
      )
      .on('click', (event, d) => {
        // Update selection in state
        const matchingOriginalNode = nodes.find(o => o.id === d.id);
        if (matchingOriginalNode) {
          setSelectedNode(matchingOriginalNode);
          playSound('click');
        }
      });

    // Draw node backgrounds
    nodeContainers.append('circle')
      .attr('r', d => d.type === 'core' ? 18 : 13)
      .attr('fill', '#090b11')
      .attr('stroke', d => {
        if (d.id === selectedNode?.id) return '#c084fc'; // highlighted purple
        if (d.type === 'core') return '#6366f1'; // indigo
        if (d.status === 'warning') return '#f59e0b'; // amber
        if (d.status === 'idle') return '#4b5563'; // gray
        return '#10b981'; // green
      })
      .attr('stroke-width', 2.5)
      .style('filter', d => d.id === selectedNode?.id ? 'drop-shadow(0 0 10px rgba(192, 132, 252, 0.4))' : 'none');

    // Inside circles labels
    nodeContainers.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('fill', '#ffffff')
      .style('font-size', '9px')
      .style('font-family', 'monospace')
      .style('font-weight', 'black')
      .text(d => {
        if (d.type === 'core') return '★';
        if (d.type === 'database') return '🔒';
        if (d.type === 'external') return '🌍';
        return '⚙';
      });

    // Label on bottom
    nodeContainers.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.type === 'core' ? 32 : 26)
      .attr('fill', '#9ca3af')
      .style('font-size', '9px')
      .style('font-family', 'sans-serif')
      .style('font-weight', 'medium')
      .text(d => d.label);

    // On tick
    simulation.on('tick', () => {
      // Update links
      linkItems
        .attr('x1', d => (d.source as NetworkNode).x || 0)
        .attr('y1', d => (d.source as NetworkNode).y || 0)
        .attr('x2', d => (d.target as NetworkNode).x || 0)
        .attr('y2', d => (d.target as NetworkNode).y || 0);

      // Update nodes translate
      nodeContainers.attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);

      // Update particle positions
      particleSelection
        .attr('cx', p => {
          const src = p.link.source as NetworkNode;
          const tgt = p.link.target as NetworkNode;
          
          p.progress += p.speed;
          if (p.progress >= 1) {
            p.progress = 0;
          }
          
          const xVal = (src.x || 0) + ((tgt.x || 0) - (src.x || 0)) * p.progress;
          return isNaN(xVal) ? 0 : xVal;
        })
        .attr('cy', p => {
          const src = p.link.source as NetworkNode;
          const tgt = p.link.target as NetworkNode;
          
          const yVal = (src.y || 0) + ((tgt.y || 0) - (src.y || 0)) * p.progress;
          return isNaN(yVal) ? 0 : yVal;
        });
    });

    // Cleanup simulation
    return () => {
      simulation.stop();
    };
  }, [activeTab, nodes, links, selectedNode, trafficInjections, isThrottling, isStealthOn]);

  return (
    <div className="h-full w-full bg-[#050608] text-zinc-300 flex font-sans overflow-hidden">
      
      {/* Settings Navigation Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#090b10] flex flex-col p-6 space-y-6">
        <div className="space-y-1.5">
          <h2 className="text-sm font-black text-white leading-none uppercase tracking-[0.1em]">Control Node</h2>
          <span className="text-[10px] text-zinc-650 font-bold tracking-widest block font-mono">SAMBI SUBSPACE OS</span>
        </div>

        <nav className="flex-1 space-y-1.5">
          <button
            onClick={() => { playSound('click'); setActiveTab('system'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-black transition-all text-left
              ${activeTab === 'system' 
                ? 'bg-indigo-500/10 border-indigo-500/20 text-white shadow-md' 
                : 'bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            <Sliders size={14} className={activeTab === 'system' ? 'text-indigo-400' : 'text-zinc-500'} />
            System & Privacy
          </button>

          <button
            onClick={() => { playSound('click'); setActiveTab('network'); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-black transition-all text-left
              ${activeTab === 'network' 
                ? 'bg-indigo-500/10 border-indigo-500/20 text-white shadow-md' 
                : 'bg-transparent border-transparent text-zinc-400 hover:text-white hover:bg-white/5'}`}
          >
            <Network size={14} className={activeTab === 'network' ? 'text-indigo-400' : 'text-zinc-500'} />
            Network Traffic
          </button>
        </nav>

        {/* Global Connection Quality Widget */}
        <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl space-y-2">
          <span className="text-[8px] font-black uppercase tracking-wider text-zinc-600">Connection Quality</span>
          <div className="flex items-center gap-2">
            <div className="flex items-end gap-0.5 h-3">
              <div className="w-1 h-1 bg-emerald-500 rounded-full" />
              <div className="w-1 h-2 bg-emerald-500 rounded-full" />
              <div className="w-1 h-3 bg-emerald-500 rounded-full" />
              <div className="w-1 h-2.5 bg-emerald-500 rounded-full" />
            </div>
            <span className="text-xs font-bold text-emerald-400">Excellent Parity</span>
          </div>
        </div>
      </aside>

      {/* Settings Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col justify-between">
        
        {/* TAB 1: System Settings */}
        {activeTab === 'system' && (
          <div className="p-8 space-y-8 max-w-4xl w-full">
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">System & Personalization</h3>
              <p className="text-xs text-zinc-500 leading-normal mt-1">Manage wallpaper backgrounds, select localized system parameters, and coordinate security nodes.</p>
            </div>

            <section className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#4d5267]">Desktop Wallpapers</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {WALLPAPERS.map((wp) => (
                  <button
                    key={wp.id}
                    onClick={() => onWallpaperChange(wp.url)}
                    className={`group relative aspect-video rounded-2xl overflow-hidden border-2 transition-all 
                      ${currentWallpaper === wp.url 
                        ? 'border-indigo-500 scale-[1.02] shadow-xl ring-4 ring-indigo-500/15' 
                        : 'border-white/5 hover:border-white/20'}`}
                  >
                    <img 
                      src={wp.url} 
                      alt={wp.name}
                      referrerPolicy="no-referrer"
                      className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-115 duration-300"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/95">{wp.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#4d5267]">Localization & Output</h4>
              <div className="p-5 bg-white/[0.01] border border-white/5 rounded-[22px] flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Globe size={18} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-zinc-200 block">System Language</span>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black block mt-0.5">Regional Parity</span>
                  </div>
                </div>

                <div className="relative">
                  <select 
                    value={currentLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="appearance-none bg-black/40 border border-white/15 hover:border-indigo-500/30 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 cursor-pointer transition-all hover:bg-black/60"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code} className="bg-zinc-950">
                        {lang.name} ({lang.native})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                    <ChevronDown size={14} />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#4d5267]">Security & Network Integrity</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-5 bg-white/[0.01] border border-white/5 rounded-2xl hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Shield size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">Secret Stealth Core</span>
                      <span className="text-[10px] text-zinc-500 block">Enable client payload obfuscation</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleStealthToggle}
                    className={`w-12 h-6 rounded-full p-1 transition-all ${isStealthOn ? 'bg-indigo-500' : 'bg-zinc-800'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${isStealthOn ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-5 bg-white/[0.01] border border-white/5 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">Integrity Layer Parity</span>
                      <span className="text-[10px] text-zinc-500 block">System secure boot sector checks finished</span>
                    </div>
                  </div>
                  <span className="text-emerald-400 font-mono text-[10px] font-black px-3 py-1 bg-emerald-500/5 rounded-full border border-emerald-500/20 tracking-wider">SECURE BOOT</span>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#4d5267]">Device Specifications</h4>
              <div className="p-5 bg-black/40 border border-white/5 rounded-[24px] grid grid-cols-2 gap-y-4 gap-x-12">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-zinc-650 uppercase tracking-wider block">Node Name</span>
                  <span className="text-xs font-bold text-zinc-200 block">Sambi-Privacy-Node</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-zinc-650 uppercase tracking-wider block">Kernel Parity Engine</span>
                  <span className="text-xs font-bold text-zinc-200 block">Core-X58 Revision v2.4</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-zinc-650 uppercase tracking-wider block">Volatile RAM</span>
                  <span className="text-xs font-bold text-zinc-200 block">16.0 GB (Stealth Sealed)</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-zinc-650 uppercase tracking-wider block">System Storage</span>
                  <span className="text-xs font-bold text-zinc-200 block">512 GB Virtual Solid State</span>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: Dynamic D3 Network Gateways */}
        {activeTab === 'network' && (
          <div className="p-8 flex flex-col gap-8 h-full w-full">
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">Active Network Traffic Graph</h3>
              <p className="text-xs text-zinc-500 leading-normal mt-1">
                Real-time connection nodes graph powered by D3 force simulation. Drag secure packets nodes to dynamically re-arrange gateways or click on any node to analyze packet flow parameters.
              </p>
            </div>

            {/* Micro Dashboard Statistics Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Activity size={18} className="animate-pulse" />
                </div>
                <div>
                  <span className="text-[9px] font-black text-zinc-550 uppercase tracking-wider block">Download Traffic</span>
                  <span className="text-sm font-mono font-black text-white">{downloadRate} KB/s</span>
                </div>
              </div>

              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-pink-500/10 text-pink-400">
                  <Send size={18} />
                </div>
                <div>
                  <span className="text-[9px] font-black text-zinc-550 uppercase tracking-wider block">Upload Traffic</span>
                  <span className="text-sm font-mono font-black text-white">{uploadRate} KB/s</span>
                </div>
              </div>

              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Wifi size={18} />
                </div>
                <div>
                  <span className="text-[9px] font-black text-zinc-550 uppercase tracking-wider block">Latency Ping</span>
                  <span className="text-sm font-mono font-black text-white">{latency} ms</span>
                </div>
              </div>

              <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Server size={18} />
                </div>
                <div>
                  <span className="text-[9px] font-black text-zinc-550 uppercase tracking-wider block">Active Tunnels</span>
                  <span className="text-sm font-mono font-black text-white">
                    {nodes.filter(n => n.status === 'active').length} / {nodes.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Core Visualization split grid */}
            <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-2">
              
              {/* Force Directed Canvas (Left 7-column) */}
              <div className="lg:col-span-8 bg-[#090b11]/80 border border-white/5 rounded-[28px] relative overflow-hidden flex flex-col justify-between">
                
                {/* Visual canvas title & quick configurations */}
                <div className="p-4 border-b border-white/5 bg-black/25 flex justify-between items-center z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">D3 Live Subsystem Force Topology</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleInjectPacket}
                      className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white font-black uppercase text-[10px] tracking-wider rounded-lg transition-all flex items-center gap-1 hover:scale-102"
                    >
                      <Send size={11} /> Inject Trace Packet
                    </button>

                    <button
                      onClick={handleToggleThrottle}
                      className={`px-3 py-1 font-black uppercase text-[10px] tracking-wider rounded-lg border transition-all flex items-center gap-1
                        ${isThrottling 
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-400' 
                          : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10'}`}
                    >
                      <AlertTriangle size={11} /> {isThrottling ? 'Unthrottle' : 'Throttle Traffic'}
                    </button>
                  </div>
                </div>

                {/* SVG Visual Canvas */}
                <div className="flex-1 w-full bg-[#050608]/40 flex items-center justify-center relative min-h-[280px]">
                  <svg 
                    ref={svgRef} 
                    className="w-full h-full block"
                    style={{ background: 'transparent' }}
                  />

                  {/* Tiny instruction prompt floating */}
                  <div className="absolute bottom-3 left-4 text-[9px] font-mono font-black text-zinc-650 tracking-wide uppercase select-none pointer-events-none">
                    🖱 Drag nodes to reposition • Click to inspect
                  </div>

                  {isThrottling && (
                    <div className="absolute top-18 right-4 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2 text-[10px] font-bold text-amber-400 uppercase tracking-widest animate-pulse pointer-events-none">
                      <AlertTriangle size={12} /> Rate Throttle Enforced
                    </div>
                  )}
                </div>

              </div>

              {/* Inspector Panel (Right 4-column) */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                
                {/* Selected Node card */}
                {selectedNode ? (
                  <div className="bg-[#090b11] border border-white/5 rounded-3xl p-6 space-y-5 animate-scale-up flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#4d5267]">Inspector Details</span>
                          <h4 className="text-sm font-black text-white">{selectedNode.label}</h4>
                        </div>
                        <span className={`text-[9px] font-mono px-2.5 py-1 rounded-full font-black border uppercase tracking-wider
                          ${selectedNode.status === 'active' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' : 
                            selectedNode.status === 'warning' ? 'bg-amber-500/5 text-amber-500 border-amber-500/20' : 
                            'bg-zinc-800 text-zinc-400 border-zinc-750'}`}>
                          {selectedNode.status}
                        </span>
                      </div>

                      <div className="h-[1px] bg-white/5" />

                      <div className="space-y-3 font-mono text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-zinc-600 font-sans font-black uppercase text-[10px] tracking-wider">Node Address</span>
                          <span className="text-zinc-300 font-semibold">{selectedNode.ip}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600 font-sans font-black uppercase text-[10px] tracking-wider">Gateway Port</span>
                          <span className="text-zinc-300 font-semibold">:{selectedNode.port}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600 font-sans font-black uppercase text-[10px] tracking-wider">Flow Protocol</span>
                          <span className="text-indigo-400 font-bold">{selectedNode.protocol}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-600 font-sans font-black uppercase text-[10px] tracking-wider">Base Rate</span>
                          <span className="text-emerald-400 font-black">
                            {isThrottling ? Math.round(selectedNode.trafficRate * 0.2) : selectedNode.trafficRate} Kb/s
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl text-[10.5px] leading-relaxed text-zinc-500">
                      This tunnel is running clean cryptographic encryption inside Sambi micro kernels. All network frames are filtered to scrub identity keys.
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#090b11] border border-white/5 rounded-3xl p-6 flex flex-col justify-center items-center text-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-white/[0.01] border border-white/5 flex items-center justify-center text-zinc-600">
                      <Network size={22} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Select a Node</h4>
                      <p className="text-[11px] text-zinc-600 max-w-[200px] leading-relaxed mx-auto">
                        Click on any node in the live graph topological visualizer to inspect diagnostic routing parameters.
                      </p>
                    </div>
                  </div>
                )}
                
              </div>

            </div>
          </div>
        )}

      </main>

    </div>
  );
}
