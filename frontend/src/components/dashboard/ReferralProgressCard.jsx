import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

export default function ReferralProgressCard({
  referralCode = 'ACAD-XM92B',
  referralCount = 0,
  earnings = 0,
  loading = false
}) {
  const [copied, setCopied] = useState(false);
  const rewards = [
    { count: 1, reward: '₹200 Bonus Credits', unlocked: referralCount >= 1 },
    { count: 5, reward: '₹1,000 Wallet Cash', unlocked: referralCount >= 5 },
    { count: 10, reward: 'Free Order Voucher', unlocked: referralCount >= 10 },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success('Referral code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card glow className="p-6 bg-void/50 border border-plasma/10 flex flex-col justify-between h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-[10px] font-mono text-muted uppercase tracking-widest block font-bold">
            Referral Center
          </span>
          <span className="text-secondary text-[11px] font-dm block mt-0.5">
            Share the code with colleagues and split the reward!
          </span>
        </div>
      </div>

      {/* Referral Code Copy Panel */}
      <div className="bg-void/65 border border-white/5 p-3 rounded-xl flex items-center justify-between mb-4">
        <div>
          <span className="text-[8.5px] font-mono text-muted uppercase block">YOUR INVITE CODE</span>
          <span className="text-plasma font-orbitron font-bold text-xs.5 tracking-wider">{referralCode}</span>
        </div>
        <Button variant="plasma" size="sm" onClick={handleCopy} className="py-1 px-3.5 text-[10px]">
          {copied ? 'Copied! ✓' : 'COPY'}
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-4.5">
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 text-center">
          <span className="text-[8px] font-mono text-muted uppercase block">SUCCESSFUL REFS</span>
          <span className="font-orbitron font-extrabold text-sm.5 text-primary mt-1 block">{referralCount}</span>
        </div>
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3.5 text-center">
          <span className="text-[8px] font-mono text-muted uppercase block">BONUS EARNED</span>
          <span className="font-orbitron font-extrabold text-sm.5 text-orbit mt-1 block">₹{earnings}</span>
        </div>
      </div>

      {/* Milestones progress */}
      <div className="border-t border-white/5 pt-4 space-y-2.5">
        <span className="text-[9px] font-mono text-muted uppercase tracking-wider block">Milestone Rewards</span>
        <div className="space-y-2">
          {rewards.map((rw, idx) => (
            <div key={idx} className="flex items-center justify-between text-[10.5px] font-mono p-1 border-b border-white/[0.01]">
              <span className={rw.unlocked ? 'text-secondary line-through opacity-60' : 'text-secondary'}>
                👥 {rw.count} Ref{rw.count > 1 ? 's' : ''}: {rw.reward}
              </span>
              <span className={rw.unlocked ? 'text-orbit text-glow-orbit font-bold' : 'text-muted'}>
                {rw.unlocked ? 'UNLOCKED ✓' : 'LOCKED'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
