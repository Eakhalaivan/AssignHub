import React from 'react';
import formatCurrency from '../../utils/formatCurrency';

export const PricingMeter = ({ wordCount = 500, level = 'undergraduate' }) => {
  // Core multipliers
  const ratePerWord = 0.05; 
  
  const multipliers = {
    highschool: 0.8,
    undergraduate: 1.0,
    master: 1.3,
    phd: 1.6,
  };

  const multiplier = multipliers[level] || 1.0;
  const total = wordCount * ratePerWord * multiplier;

  return (
    <div className="glass bg-sky-950/5 border border-sky-900/10 rounded-2xl p-6 flex justify-between items-center relative overflow-hidden">
      {/* Small neon accent background blip */}
      <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-sky-500/10 blur-3xl rounded-full pointer-events-none" />

      <div>
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Dynamic Valuation</span>
        <div className="text-xs text-zinc-400 flex items-center gap-2 font-mono">
          <span>{wordCount} words</span>
          <span className="text-zinc-600">•</span>
          <span>x{multiplier} Tier Weight</span>
        </div>
      </div>

      <div className="text-right">
        <span className="text-[10px] font-bold text-sky-500/60 uppercase tracking-wider block">Projected Invoice</span>
        <span className="text-3xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500 shadow-glow-accent/20">
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
};

export default PricingMeter;
