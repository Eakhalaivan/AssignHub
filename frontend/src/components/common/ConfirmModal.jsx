import React from 'react';
import GlowButton from './GlowButton';

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Execute", isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
      <div className="glass w-full max-w-md rounded-3xl overflow-hidden p-8 border border-zinc-800 shadow-3xl flex flex-col relative animate-[scaleIn_0.3s_cubic-bezier(0.16,1,0.3,1)]">
        <h3 className="text-xl font-bold tracking-wide text-zinc-100 mb-3 uppercase">
          {title}
        </h3>
        <p className="text-zinc-400 text-sm leading-relaxed mb-8">
          {message}
        </p>

        <div className="flex justify-end gap-3 mt-auto">
          <GlowButton variant="outline" onClick={onClose} disabled={isLoading} className="px-5 py-2.5 text-xs tracking-wider uppercase">
            Abort
          </GlowButton>
          <GlowButton 
            variant="accent" 
            onClick={onConfirm} 
            disabled={isLoading} 
            className="px-6 py-2.5 text-xs font-bold tracking-wider uppercase bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.4)]"
          >
            {isLoading ? 'Executing...' : confirmText}
          </GlowButton>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
