
import {motion} from 'motion/react';
import * as LucideIcons from 'lucide-react';

interface DesktopIconProps {
  key?: string | number;
  name: string;
  icon: string;
  color?: string;
  onOpen: () => void;
}

export default function DesktopIcon({name, icon, color, onOpen}: DesktopIconProps) {
  const IconComponent = (LucideIcons as any)[icon];

  return (
    <motion.button
      whileHover={{ scale: 1.1, rotate: [0, -2, 2, 0] }}
      whileTap={{ scale: 0.9 }}
      onClick={onOpen}
      onDoubleClick={onOpen}
      className="w-20 h-20 md:w-24 md:h-24 flex flex-col items-center justify-center gap-1.5 md:gap-2 p-1 md:p-2 rounded-2xl group hover:bg-white/5 transition-all cursor-default select-none relative"
    >
      <div className={`w-12 h-12 md:w-14 md:h-14 ${color || 'bg-white/5'} rounded-xl md:rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 group-hover:shadow-indigo-500/40 relative overflow-hidden ring-1 ring-white/10 group-hover:ring-white/30 backdrop-blur-sm`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {IconComponent && <IconComponent size={24} className="text-white md:hidden drop-shadow-lg transition-transform group-hover:scale-110 z-10" />}
        {IconComponent && <IconComponent size={28} className="hidden md:block text-white drop-shadow-lg transition-transform group-hover:scale-110 z-10" />}
      </div>
      <span className="text-[9px] md:text-[10px] font-black text-white/60 group-hover:text-white text-center drop-shadow-xl truncate w-full px-1 transition-all uppercase tracking-[0.15em] md:tracking-[0.2em]">
        {name}
      </span>
      {/* Subtle background glow on hover */}
      <div className={`absolute inset-0 p-4 -z-10 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity rounded-full ${color || 'bg-white'}`} />
    </motion.button>
  );
}
