import React from 'react';
import clsx from 'clsx';
import AntigravityCard from '../common/AntigravityCard';

export const MetricOrb = ({ title, value, trend, iconColor = 'sky', index = 0 }) => {
  const colorThemes = {
    sky: "from-sky-500 to-sky-600 text-sky-400 shadow-sky-500/20",
    emerald: "from-emerald-500 to-emerald-600 text-emerald-400 shadow-emerald-500/20",
    violet: "from-violet-500 to-violet-600 text-violet-400 shadow-violet-500/20",
    amber: "from-amber-500 to-amber-600 text-amber-400 shadow-amber-500/20",
  };

  const theme = colorThemes[iconColor] || colorThemes.sky;

  return (
    <AntigravityCard
      variant="elevated"
      animate="fade-up"
      delay={index * 0.1}
      accent="tl"
      className="bg-zinc-900/40 p-6 relative overflow-hidden group transition-all duration-500 hover:border-zinc-700/60"
    >
      {/* Background glowing accent blur */}
      <div className={clsx("absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br blur-3xl rounded-full pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity", theme.split(' ').slice(0,2).join(' '))} />

      <span className="text-[10px] font-black tracking-widest text-zinc-500 uppercase block mb-3">
        {title}
      </span>

      <div className="flex items-baseline justify-between relative z-10">
        <h3 className="text-4xl font-black font-mono text-zinc-100 tracking-tight">
          {value}
        </h3>
        
        {trend && (
          <span className={clsx(
            "text-xs font-bold font-mono px-2 py-0.5 rounded bg-zinc-950 border",
            trend > 0 ? "text-emerald-400 border-emerald-950" : "text-rose-400 border-rose-950"
          )}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
    </AntigravityCard>
  );
};

export default MetricOrb;
