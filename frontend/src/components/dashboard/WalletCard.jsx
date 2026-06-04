import React from 'react';
import { motion } from 'framer-motion';
import AntigravityCard from '../common/AntigravityCard';
import { Button } from '../ui/Button';

export default function WalletCard({ 
  balance = 0.00, 
  onDeposit, 
  transactions = [],
  loading = false 
}) {
  return (
    <AntigravityCard
      variant="plasma"
      shimmer
      accent="all"
      className="relative p-6 bg-void/50 flex flex-col justify-between h-full min-h-[220px]"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-plasma/5 blur-2xl pointer-events-none rounded-full" />
      
      <div className="flex justify-between items-center mb-4">
        <div>
          <span className="text-[10px] font-mono text-muted uppercase tracking-widest block font-bold">
            Antigravity Secure Wallet
          </span>
          <span className="text-[9px] font-mono text-orbit uppercase tracking-widest font-semibold flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orbit animate-pulse" />
            PCI-DSS Encrypted
          </span>
        </div>
        <div className="w-9 h-9 rounded-lg bg-plasma/10 border border-plasma/25 flex items-center justify-center text-plasma">
          💳
        </div>
      </div>

      <div className="my-3">
        <span className="text-muted text-[10px] font-mono block">AVAILABLE BALANCE</span>
        <h2 className="font-orbitron font-black text-3.5xl text-primary text-glow-plasma leading-tight mt-1">
          ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </h2>
      </div>

      <div className="flex gap-2.5 mt-4 border-t border-white/5 pt-4">
        <Button 
          variant="plasma" 
          size="sm" 
          onClick={onDeposit} 
          disabled={loading}
          className="w-full text-[10px] font-bold"
        >
          ⚡ Quick Deposit
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={() => {}} 
          disabled={true}
          className="w-full text-[10px] hover:text-muted cursor-not-allowed"
        >
          Withdraw
        </Button>
      </div>

      {transactions.length > 0 && (
        <div className="mt-5 space-y-2 select-none border-t border-white/5 pt-4.5">
          <p className="text-[9px] font-mono text-muted uppercase tracking-wider mb-2">Recent Payments</p>
          <div className="max-h-24 overflow-y-auto space-y-1.5 pr-1">
            {transactions.slice(0, 3).map((tx, idx) => (
              <div key={tx.id || idx} className="flex justify-between items-center text-[10px] font-mono py-1 border-b border-white/[0.02]">
                <span className="text-secondary truncate max-w-[120px]">{tx.description || 'Deposit Credits'}</span>
                <span className={tx.type === 'DEPOSIT' ? 'text-orbit' : 'text-alert'}>
                  {tx.type === 'DEPOSIT' ? '+' : '-'}₹{tx.amount}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </AntigravityCard>
  );
}
