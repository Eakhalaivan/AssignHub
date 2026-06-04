import { Card } from '../ui/Card';
import clsx from 'clsx';

export default function FraudRiskMeter({ riskScore = 15, factors = [] }) {
  const getRiskStatus = (score) => {
    if (score < 30) return { label: 'LOW RISK', color: 'text-orbit border-orbit/30 bg-orbit/5', glow: 'text-glow-orbit' };
    if (score < 70) return { label: 'MEDIUM RISK', color: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/5', glow: 'text-shadow-[0_0_10px_#f59e0b]' };
    return { label: 'HIGH RISK ALERT', color: 'text-alert border-alert/30 bg-alert/5', glow: 'text-glow-alert' };
  };

  const status = getRiskStatus(riskScore);

  return (
    <Card glow className="p-6 bg-void/50 border border-white/5 h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-[10px] font-mono text-muted uppercase tracking-widest block font-bold">
            Risk & Fraud Assessment
          </span>
          <span className="text-secondary text-[11px] font-dm block mt-0.5">
            Real-time compliance monitoring engine
          </span>
        </div>
        <div className={clsx('text-[9px] font-mono border px-2.5 py-0.5 rounded-full font-bold uppercase', status.color)}>
          {status.label}
        </div>
      </div>

      {/* Meter Bar */}
      <div className="space-y-2.5 my-4.5">
        <div className="flex justify-between items-end">
          <span className="text-[9px] font-mono text-muted uppercase">SYSTEM SUSPICION RATIO</span>
          <span className={clsx('font-orbitron font-extrabold text-xl', status.glow)}>
            {riskScore}%
          </span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden flex">
          <div 
            className="bg-orbit h-full transition-all duration-300"
            style={{ width: `${Math.min(riskScore, 30)}%` }}
          />
          <div 
            className="bg-yellow-500 h-full transition-all duration-300"
            style={{ width: `${Math.max(0, Math.min(riskScore - 30, 40))}%` }}
          />
          <div 
            className="bg-alert h-full transition-all duration-300"
            style={{ width: `${Math.max(0, riskScore - 70)}%` }}
          />
        </div>
      </div>

      {/* Critical risk factors list */}
      {factors.length > 0 ? (
        <div className="border-t border-white/5 pt-4 space-y-2">
          <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Risk Factors Identified</span>
          <div className="space-y-1.5">
            {factors.map((f, idx) => (
              <div key={idx} className="text-[10px] font-mono text-secondary flex items-start gap-1.5">
                <span className="text-alert font-bold">!</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border-t border-white/5 pt-4 text-center py-2 text-[10px] font-mono text-muted uppercase">
          ✓ Zero compliance flags raised
        </div>
      )}
    </Card>
  );
}
