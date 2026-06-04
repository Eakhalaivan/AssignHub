import React from 'react';
import AntigravityCard from '../common/AntigravityCard';
import { Button } from '../../components/ui/Button';
import StatusBadge from '../common/StatusBadge';
import formatCurrency from '../../utils/formatCurrency';
import { formatDistanceToNow } from 'date-fns';
import { Clock } from 'lucide-react';

function getUrgencyTier(deadline) {
  if (!deadline) return 'normal';
  const ms = new Date(deadline) - Date.now();
  const hours = ms / (1000 * 60 * 60);
  if (hours < 0)   return 'overdue';
  if (hours < 6)   return 'critical';
  if (hours < 24)  return 'urgent';
  return 'normal';
}

const URGENCY_VARIANT = {
  overdue:  'danger',
  critical: 'danger',
  urgent:   'warning',
  normal:   'default',
};

const URGENCY_TIME_CLASS = {
  overdue:  'text-[#cb6e6e] font-semibold',
  critical: 'text-[#cb6e6e] font-semibold',
  urgent:   'text-[#dfa157] font-semibold',
  normal:   'text-zinc-300 font-medium',
};

export const AssignmentCard = ({ assignment, index = 0, onAction, actionLabel = 'View Specifications' }) => {
  const tier = getUrgencyTier(assignment?.deadline);
  const variant = URGENCY_VARIANT[tier];

  const timeLabel = assignment?.deadline
    ? formatDistanceToNow(new Date(assignment.deadline), { addSuffix: true })
    : 'No deadline set';

  return (
    <AntigravityCard
      variant={variant}
      animate="scale-in"
      delay={index * 0.05}
      className="flex flex-col justify-between h-full p-5 bg-[#111113] border-white/5"
    >
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3.5 select-none">
          <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest bg-zinc-900 border border-white/5 px-2.5 py-0.5 rounded">
            {assignment?.academicLevel || 'STANDARD'}
          </span>
          <StatusBadge status={assignment?.status} />
        </div>

        <h3 className="text-sm font-orbitron font-semibold text-zinc-100 mb-3 truncate uppercase tracking-wider">
          {assignment?.title || 'Academic Order'}
        </h3>

        {/* Metrics row */}
        <div className="grid grid-cols-2 gap-3 mb-4 select-none">
          <div className="bg-void border border-white/5 px-3 py-2 rounded flex flex-col gap-0.5 font-mono">
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest">Payout</span>
            <span className="text-xs font-semibold text-[#c5a880]">
              {formatCurrency(assignment?.writerEarning ?? assignment?.payout ?? 0)}
            </span>
          </div>
          <div className="bg-void border border-white/5 px-3 py-2 rounded flex flex-col gap-0.5 font-mono">
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest">Volume</span>
            <span className="text-xs font-semibold text-secondary">
              {assignment?.pages ?? assignment?.wordCount ?? '—'} Pages
            </span>
          </div>
        </div>

        {/* Time remaining */}
        <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-500 uppercase mb-4 select-none">
          <Clock className="w-3.5 h-3.5 text-zinc-600 shrink-0" />
          <span>Remaining:</span>
          <span className={URGENCY_TIME_CLASS[tier]}>{timeLabel}</span>
        </div>
      </div>

      {/* CTA */}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onAction?.(assignment)}
        className="w-full text-[10px] font-bold tracking-wider font-orbitron"
      >
        {actionLabel}
      </Button>
    </AntigravityCard>
  );
};

export default AssignmentCard;
