import React from 'react';
import AntigravityCard from '../common/AntigravityCard';
import GlowButton from '../common/GlowButton';

export const WriterVerifyCard = ({ writer, onApprove, onReject, isLoading }) => {
  return (
    <AntigravityCard
      status={writer.isVerified ? 'online' : 'pending'}
      animate="slide-left"
      className="flex flex-col gap-6 border-l-4 border-l-violet-500/40"
    >
      <div className="flex items-start justify-between gap-4 border-b border-zinc-800/40 pb-4">
        <div>
          <h3 className="text-lg font-bold text-zinc-100 mb-0.5">{writer.name}</h3>
          <p className="text-xs text-zinc-500 font-mono">{writer.email}</p>
        </div>
        <span className="text-[10px] font-black tracking-widest text-violet-400 uppercase bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
          {writer.specialization || 'General'}
        </span>
      </div>

      <div className="space-y-4 text-sm flex-1">
        <div>
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Stated Credentials</span>
          <p className="text-zinc-300 italic text-xs bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/50">
            "{writer.credentials || 'No written credentials provided.'}"
          </p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-zinc-500 block mb-0.5">Degree Claim</span>
            <span className="text-zinc-300 font-semibold">{writer.education || 'Bachelor of Arts'}</span>
          </div>
          <div>
            <span className="text-zinc-500 block mb-0.5">Experience</span>
            <span className="text-zinc-300 font-semibold">{writer.experienceYears || '0'} Years</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t border-zinc-800/40 mt-auto">
        <GlowButton
          variant="outline"
          disabled={isLoading}
          onClick={() => onReject(writer.id)}
          className="flex-1 text-rose-400 border-rose-950/50 hover:border-rose-500/30 hover:bg-rose-500/5 text-xs font-bold tracking-wider uppercase py-2"
        >
          Reject
        </GlowButton>
        <GlowButton
          disabled={isLoading}
          onClick={() => onApprove(writer.id)}
          className="flex-1 bg-violet-600 text-white font-bold text-xs tracking-wider uppercase hover:bg-violet-500 hover:shadow-glow shadow-violet-500/30 py-2"
        >
          Approve
        </GlowButton>
      </div>
    </AntigravityCard>
  );
};

export default WriterVerifyCard;
