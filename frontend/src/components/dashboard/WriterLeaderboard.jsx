import { Card } from '../ui/Card';
import clsx from 'clsx';

export default function WriterLeaderboard({ writers = [] }) {
  const defaultWriters = [
    { name: 'Sarah K.', orders: 142, rating: 4.95, tier: 'PLATINUM' },
    { name: 'David M.', orders: 98, rating: 4.91, tier: 'GOLD' },
    { name: 'Emma L.', orders: 74, rating: 4.88, tier: 'GOLD' },
    { name: 'James W.', orders: 53, rating: 4.85, tier: 'SILVER' },
    { name: 'Elena R.', orders: 39, rating: 4.82, tier: 'SILVER' }
  ];

  const ranking = writers.length > 0 ? writers : defaultWriters;

  return (
    <Card glow className="p-6 bg-void/50 border border-white/5 h-full">
      <div className="flex justify-between items-center mb-4.5">
        <div>
          <span className="text-[10px] font-mono text-muted uppercase tracking-widest block font-bold">
            Elite Academic League
          </span>
          <span className="text-secondary text-[11px] font-dm block mt-0.5">
            Top academic writers this semester
          </span>
        </div>
        <div className="w-8.5 h-8.5 rounded-lg bg-orbit/10 border border-orbit/25 flex items-center justify-center text-orbit">
          🏆
        </div>
      </div>

      <div className="space-y-2.5">
        {ranking.map((w, idx) => {
          const isTopThree = idx < 3;
          return (
            <div 
              key={idx} 
              className={clsx(
                'flex items-center gap-3.5 p-2 rounded-xl border border-transparent transition-all',
                idx === 0 && 'bg-orbit/5 border-orbit/10 shadow-[0_0_10px_rgba(6,255,165,0.05)]'
              )}
            >
              {/* Rank indicator */}
              <div className={clsx(
                'w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-black',
                idx === 0 && 'bg-orbit text-void shadow-[0_0_6px_#06ffa5]',
                idx === 1 && 'bg-slate-300 text-void',
                idx === 2 && 'bg-[#cd7f32] text-void',
                idx > 2 && 'bg-white/5 text-muted'
              )}>
                {idx + 1}
              </div>

              {/* Writer Avatar Initials */}
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-orbitron text-xs font-bold text-secondary">
                {w.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>

              <div>
                <span className="text-secondary font-orbitron font-bold text-xs.5 block">{w.name}</span>
                <span className="text-muted text-[9px] font-mono block uppercase">{w.tier || 'BRONZE'} RANK</span>
              </div>

              <div className="ml-auto text-right">
                <span className="text-orbit font-bold text-xs block">{w.rating} ★</span>
                <span className="text-muted text-[8.5px] font-mono block uppercase">{w.orders} ORDERS DONE</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
