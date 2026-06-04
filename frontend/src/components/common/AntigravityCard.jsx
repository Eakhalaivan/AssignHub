import React from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';

// Refined Luxury Theme Color Map
const VARIANTS = {
  default: 'bg-[#111113] border border-white/5 text-primary',
  elevated: 'bg-[#141417] border border-white/10 text-primary shadow-premium',
  ghost: 'bg-transparent border border-dashed border-white/5 text-muted',
  success: 'bg-[#70a382]/5 border border-[#70a382]/20 text-[#70a382]',
  danger: 'bg-[#cb6e6e]/5 border border-[#cb6e6e]/20 text-[#cb6e6e]',
  warning: 'bg-[#dfa157]/5 border border-[#dfa157]/20 text-[#dfa157]',
  plasma: 'bg-[#c5a880]/10 border border-[#c5a880]/30 text-[#c5a880]',
};

// Shimmer style for skeleton loading state
const shimmerStyle = {
  background: 'linear-gradient(90deg, #121214 0%, #202023 40%, #121214 100%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 2s linear infinite',
};

function SkeletonContent() {
  return (
    <div className="h-full w-full min-h-[120px] p-5 flex flex-col gap-3 select-none" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="h-2 w-16 rounded" style={shimmerStyle} />
        <div className="h-5 w-5 rounded-full" style={shimmerStyle} />
      </div>
      <div className="h-4 w-3/4 rounded mt-1" style={shimmerStyle} />
      <div className="h-2 w-full rounded" style={shimmerStyle} />
      <div className="h-2 w-5/6 rounded" style={shimmerStyle} />
      <div className="flex gap-2 mt-auto pt-2">
        <div className="h-7 w-20 rounded" style={shimmerStyle} />
        <div className="h-7 w-16 rounded" style={shimmerStyle} />
      </div>
    </div>
  );
}

export default function AntigravityCard({
  children,
  className,
  variant = 'default',
  hover = true,
  onClick,
  interactive = false,
  ripple = false,
  shimmer = false,
  accent = false,
  tilt = false,
  status,
  loading = false,
  animate = false,
  delay = 0,
  as: Tag = 'div',
  style,
  ...rest
}) {
  const vtClass = VARIANTS[variant] || VARIANTS.default;

  const cardJsx = (
    <Tag
      onClick={!loading ? onClick : undefined}
      style={style}
      className={clsx(
        'rounded-md relative overflow-hidden transition-all duration-200',
        vtClass,
        hover && !loading && 'hover:-translate-y-0.5 hover:border-zinc-700',
        onClick && !loading && 'cursor-pointer',
        className
      )}
      {...rest}
    >
      {loading ? <SkeletonContent /> : <div className="h-full w-full">{children}</div>}
    </Tag>
  );

  if (animate && !loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut', delay }}
        className="h-full w-full"
      >
        {cardJsx}
      </motion.div>
    );
  }

  return cardJsx;
}