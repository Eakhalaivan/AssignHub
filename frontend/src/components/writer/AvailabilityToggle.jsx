import React from 'react';
import clsx from 'clsx';

export const AvailabilityToggle = ({ isAvailable, onToggle, isLoading }) => {
  return (
    <button
      onClick={onToggle}
      disabled={isLoading}
      className={clsx(
        "flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all duration-300 select-none focus:outline-none shadow-sm",
        isAvailable 
          ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" 
          : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:text-zinc-300"
      )}
    >
      <span className="relative flex h-3 w-3">
        {isAvailable && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        )}
        <span className={clsx(
          "relative inline-flex rounded-full h-3 w-3",
          isAvailable ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-zinc-700"
        )} />
      </span>
      
      <span className="text-xs font-black tracking-widest uppercase">
        {isLoading ? 'Synchronizing...' : isAvailable ? 'Online for Ops' : 'Offline'}
      </span>
    </button>
  );
};

export default AvailabilityToggle;
