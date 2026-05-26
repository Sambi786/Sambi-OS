import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Cpu, Activity, Zap, HardDrive } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsData {
  time: string;
  cpu: number;
  memory: number;
}

export default function Performance() {
  const [data, setData] = useState<StatsData[]>([]);
  const [currentCpu, setCurrentCpu] = useState(0);
  const [currentMem, setCurrentMem] = useState(0);

  useEffect(() => {
    // Initial data
    const initialData: StatsData[] = Array.from({ length: 20 }, (_, i) => ({
      time: new Date(Date.now() - (20 - i) * 2000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      cpu: Math.floor(Math.random() * 30) + 10,
      memory: Math.floor(Math.random() * 20) + 40,
    }));
    setData(initialData);

    const interval = setInterval(() => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const newCpu = Math.floor(Math.random() * 40) + 10;
      const newMem = Math.floor(Math.random() * 10) + 45;
      
      setCurrentCpu(newCpu);
      setCurrentMem(newMem);

      setData(prev => {
        const newData = [...prev.slice(1), { time: now, cpu: newCpu, memory: newMem }];
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#0c0d10] text-white p-8 overflow-y-auto no-scrollbar">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase mb-1">System Resource Monitor</h2>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Real-time Kernel Telemetry v2.4</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Live Status</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 group hover:bg-white/10 transition-all">
          <Cpu className="text-indigo-400 mb-6" size={24} />
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Processor Load</div>
          <div className="text-3xl font-black">{currentCpu}%</div>
          <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-indigo-500 origin-left" 
              initial={{ width: 0 }}
              animate={{ width: `${currentCpu}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 group hover:bg-white/10 transition-all">
          <Activity className="text-rose-400 mb-6" size={24} />
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Memory Usage</div>
          <div className="text-3xl font-black">{currentMem}%</div>
          <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-rose-500 origin-left" 
              initial={{ width: 0 }}
              animate={{ width: `${currentMem}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 group hover:bg-white/10 transition-all">
          <HardDrive className="text-emerald-400 mb-6" size={24} />
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Disk Stability</div>
          <div className="text-3xl font-black">94%</div>
          <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-emerald-500 origin-left" 
              initial={{ width: 0 }}
              animate={{ width: "94%" }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[32px] p-8 group hover:bg-white/10 transition-all">
          <Zap className="text-amber-400 mb-6" size={24} />
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">System Entropy</div>
          <div className="text-3xl font-black">LOW</div>
          <div className="mt-4 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Optimized state active</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-[48px] p-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black tracking-tight">CPU Convergence</h3>
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Core Distribution History</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#ffffff40" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  hide={true}
                />
                <YAxis 
                  stroke="#ffffff40" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '10px', color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cpu" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCpu)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[48px] p-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black tracking-tight">Memory Saturation</h3>
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Buffer Allocation Flow</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#ffffff40" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  hide={true}
                />
                <YAxis 
                  stroke="#ffffff40" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '10px', color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="memory" 
                  stroke="#f43f5e" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorMem)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
