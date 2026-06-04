import React, { useState } from 'react';
import GlowButton from '../common/GlowButton';

export const RatingModal = ({ isOpen, onClose, onSubmit, isLoading }) => {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="glass w-full max-w-md rounded-3xl p-8 border border-zinc-800 shadow-3xl animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        <h3 className="text-xl font-black tracking-wide text-zinc-100 mb-2 uppercase">
          Performance Review
        </h3>
        <p className="text-zinc-500 text-xs tracking-wide mb-6">Submit telemetry regarding writer execution speed & quality.</p>

        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setRating(num)}
              className="text-3xl outline-none transition-transform duration-200 active:scale-90 hover:scale-110"
            >
              {num <= rating ? (
                <span className="text-sky-400 drop-shadow-[0_0_6px_rgba(56,189,248,0.4)]">★</span>
              ) : (
                <span className="text-zinc-700">☆</span>
              )}
            </button>
          ))}
        </div>

        <div className="mb-8">
          <label className="block text-[10px] font-bold tracking-widest text-zinc-500 uppercase mb-2">Telemetry Log (Optional)</label>
          <textarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Include specific feedback or praise..."
            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:border-sky-500/50 outline-none transition-all duration-300 resize-none"
          />
        </div>

        <div className="flex justify-end gap-3">
          <GlowButton variant="outline" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-xs tracking-wider uppercase">
            Cancel
          </GlowButton>
          <GlowButton 
            onClick={() => onSubmit({ rating, feedback })} 
            disabled={isLoading} 
            className="px-6 py-2.5 text-xs font-bold tracking-wider uppercase bg-sky-500"
          >
            {isLoading ? 'Submitting...' : 'Confirm Rating'}
          </GlowButton>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
