import clsx from 'clsx';

const config = {
  // Order statuses
  PENDING:     { label: 'Pending',     cls: 'text-[#dfa157] border-[#dfa157]/20 bg-[#dfa157]/5' },
  ASSIGNED:    { label: 'Assigned',    cls: 'text-zinc-400 border-zinc-700 bg-zinc-800/30' },
  IN_PROGRESS: { label: 'In Progress', cls: 'text-[#c5a880] border-[#c5a880]/20 bg-[#c5a880]/5' },
  COMPLETED:   { label: 'Completed',   cls: 'text-[#70a382] border-[#70a382]/20 bg-[#70a382]/5' },
  DELIVERED:   { label: 'Delivered',   cls: 'text-[#70a382] border-[#70a382]/30 bg-[#70a382]/10' },
  CANCELLED:   { label: 'Cancelled',   cls: 'text-[#cb6e6e] border-[#cb6e6e]/20 bg-[#cb6e6e]/5' },
  
  // Payment / other statuses
  PAID:        { label: 'Paid',        cls: 'text-[#70a382] border-[#70a382]/20 bg-[#70a382]/5' },
  REFUNDED:    { label: 'Refunded',    cls: 'text-zinc-400 border-zinc-700 bg-zinc-800/30' },
  FAILED:      { label: 'Failed',      cls: 'text-[#cb6e6e] border-[#cb6e6e]/20 bg-[#cb6e6e]/5' },
  
  // Verification / general
  APPROVED:    { label: 'Approved',    cls: 'text-[#70a382] border-[#70a382]/25 bg-[#70a382]/5' },
  REJECTED:    { label: 'Rejected',    cls: 'text-[#cb6e6e] border-[#cb6e6e]/25 bg-[#cb6e6e]/5' },
  ACTIVE:      { label: 'Active',      cls: 'text-[#70a382] border-[#70a382]/20 bg-[#70a382]/5' },
  INACTIVE:    { label: 'Inactive',    cls: 'text-zinc-500 border-zinc-800 bg-zinc-900/50' },
  
  // Disputes
  OPEN:        { label: 'Open',        cls: 'text-[#dfa157] border-[#dfa157]/20 bg-[#dfa157]/5' },
  RESOLVED:    { label: 'Resolved',    cls: 'text-[#70a382] border-[#70a382]/20 bg-[#70a382]/5' },
};

export default function StatusBadge({ status }) {
  const normStatus = String(status || '').toUpperCase();
  const { label, cls } = config[normStatus] || { label: status, cls: 'text-zinc-400 border-zinc-850 bg-zinc-900/30' };

  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium border uppercase tracking-wider', cls)}>
      {label}
    </span>
  );
}