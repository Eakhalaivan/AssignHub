import React from 'react';
import clsx from 'clsx';

export const OrderTracker = ({ status = 'pending' }) => {
  const steps = ['pending', 'assigned', 'in_progress', 'completed'];
  const currentIdx = steps.indexOf(status?.toLowerCase()) !== -1 ? steps.indexOf(status?.toLowerCase()) : 0;

  const formatLabel = (s) => s.replace('_', ' ').toUpperCase();

  return (
    <div className="w-full py-8">
      <div className="relative flex justify-between items-center">
        {/* Background track */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-zinc-800/50 rounded-full z-0" />
        
        {/* Dynamic filling track */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-sky-500 to-blue-500 rounded-full z-0 transition-all duration-1000 ease-out"
          style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIdx;
          const isActive = idx === currentIdx;
          const isPending = idx > currentIdx;

          return (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <div 
                className={clsx(
                  "w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all duration-500 backdrop-blur-md",
                  isCompleted && "bg-sky-500 border-sky-400 text-white shadow-glow-accent/40",
                  isActive && "bg-zinc-950 border-sky-400 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.3)] scale-110",
                  isPending && "bg-zinc-900 border-zinc-800 text-zinc-500"
                )}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                ) : (
                  idx + 1
                )}
              </div>
              <span 
                className={clsx(
                  "absolute top-14 text-[10px] font-black tracking-widest whitespace-nowrap transition-all duration-500",
                  isActive ? "text-sky-400" : isCompleted ? "text-zinc-300" : "text-zinc-600"
                )}
              >
                {formatLabel(step)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTracker;
