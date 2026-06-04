import React, { useState } from 'react';
import GlowButton from '../common/GlowButton';

export const AssignModal = ({ isOpen, onClose, onConfirm, writers = [], order, isLoading }) => {
  const [selectedWriterId, setSelectedWriterId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedWriterId) return;
    onConfirm(order.id, selectedWriterId);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="glass w-full max-w-md rounded-3xl p-8 border border-zinc-800 shadow-3xl animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        <h3 className="text-xl font-black tracking-wide text-zinc-100 mb-1 uppercase">
          Allocate Subnode
        </h3>
        <p className="text-zinc-500 text-xs tracking-wide mb-6 truncate">Select computational node (writer) for directive: "{order?.title}"</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-2">Available Resources</label>
            <select
              required
              value={selectedWriterId}
              onChange={(e) => setSelectedWriterId(e.target.value)}
              className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3.5 text-zinc-200 focus:border-sky-500/50 outline-none transition-all duration-300 cursor-pointer text-sm"
            >
              <option value="" className="bg-zinc-950">Select Available Writer...</option>
              {writers.map((writer) => (
                <option key={writer.id} value={writer.id} className="bg-zinc-950">
                  {writer.name} ({writer.specialization || 'Core'}) • Rating: {writer.rating || 5.0}★
                </option>
              ))}
            </select>
            {writers.length === 0 && (
              <p className="text-[10px] text-amber-500 mt-2 font-bold uppercase">No available computational units detected.</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <GlowButton variant="outline" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-xs tracking-wider uppercase">
              Abort
            </GlowButton>
            <GlowButton 
              type="submit"
              disabled={isLoading || !selectedWriterId} 
              className="px-6 py-2.5 text-xs font-bold tracking-wider uppercase bg-amber-600 text-white hover:bg-amber-500"
            >
              {isLoading ? 'Bridging...' : 'Link Resource'}
            </GlowButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignModal;
