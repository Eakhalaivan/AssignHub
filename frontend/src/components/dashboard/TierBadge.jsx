import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function TierBadge({ tier = 'BRONZE', orderCount = 0 }) {
  const tiers = {
    BRONZE: {
      name: 'Bronze Level',
      glow: 'shadow-[0_0_12px_rgba(205,127,50,0.3)] border-[#cd7f32]/30 text-[#cd7f32] bg-[#cd7f32]/5',
      accent: '#cd7f32',
      benefit: 'Standard matching speed • Base pay scale',
      next: 'Silver Level',
      target: 10
    },
    SILVER: {
      name: 'Silver Level',
      glow: 'shadow-[0_0_15px_rgba(192,192,192,0.4)] border-[#c0c0c0]/35 text-[#c0c0c0] bg-[#c0c0c0]/5',
      accent: '#c0c0c0',
      benefit: 'Priority matching +5% • Standard matching speed',
      next: 'Gold Level',
      target: 25
    },
    GOLD: {
      name: 'Gold Level',
      glow: 'shadow-[0_0_20px_rgba(250,204,21,0.5)] border-yellow-500/40 text-yellow-500 bg-yellow-500/5',
      accent: '#f59e0b',
      benefit: 'Premium assignments +10% • Standard matching speed',
      next: 'Platinum Elite',
      target: 50
    },
    PLATINUM: {
      name: 'Platinum Elite',
      glow: 'shadow-[0_0_25px_rgba(0,212,255,0.6)] border-plasma/50 text-plasma bg-plasma/5',
      accent: '#00d4ff',
      benefit: 'Instant auto-match +15% • Direct support channel',
      next: 'Ultimate Level',
      target: 100
    }
  };

  const t = tiers[tier?.toUpperCase()] || tiers.BRONZE;
  const progressPercent = Math.min((orderCount / t.target) * 100, 100);

  return (
    <div className={clsx(
      'border rounded-2xl p-5 relative overflow-hidden transition-all duration-300 glass bg-void/35',
      t.glow
    )}>
      {/* Absolute layout glows */}
      <div 
        className="absolute -top-10 -right-10 w-20 h-20 blur-xl opacity-20 pointer-events-none rounded-full" 
        style={{ backgroundColor: t.accent }}
      />

      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="text-[9px] font-mono text-muted uppercase tracking-widest block">
            Writer Rank Status
          </span>
          <h4 className="font-orbitron font-extrabold text-sm tracking-wider uppercase mt-1">
            {t.name}
          </h4>
        </div>
        <div className="text-[10px] font-mono border px-2 py-0.5 rounded-full" style={{ borderColor: `${t.accent}40`, color: t.accent }}>
          ★ VERIFIED
        </div>
      </div>

      <p className="text-muted text-[10.5px] leading-relaxed mb-4">
        🎁 Benefits: <strong className="text-secondary">{t.benefit}</strong>
      </p>

      {/* Progress tracker to next level */}
      {progressPercent < 100 ? (
        <div className="space-y-1.5 pt-1.5 border-t border-white/5">
          <div className="flex justify-between items-center text-[9px] font-mono text-muted">
            <span>PROGRESS TO {t.next.toUpperCase()}</span>
            <span>{orderCount} / {t.target} ORDERS</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ backgroundColor: t.accent, boxShadow: `0 0 8px ${t.accent}` }}
            />
          </div>
        </div>
      ) : (
        <div className="text-[9.5px] font-mono text-orbit text-glow-orbit border-t border-white/5 pt-2 flex items-center gap-1.5">
          <span>✓ MAXIMUM RANK CONQUERED</span>
        </div>
      )}
    </div>
  );
}
