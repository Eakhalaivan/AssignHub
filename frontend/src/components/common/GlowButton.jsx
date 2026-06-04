import clsx from 'clsx';

const variants = {
  plasma: 'bg-plasma/10 border border-plasma/40 text-plasma hover:bg-plasma hover:text-void hover:shadow-glow-plasma',
  orbit:  'bg-orbit/10 border border-orbit/40 text-orbit hover:bg-orbit hover:text-void hover:shadow-glow-orbit',
  nova:   'bg-nova/20 border border-nova/40 text-white hover:bg-nova hover:shadow-glow-nova',
  alert:  'bg-alert/10 border border-alert/30 text-alert hover:bg-alert hover:text-white hover:shadow-glow-alert',
  ghost:  'bg-transparent border border-white/10 text-secondary hover:border-plasma/40 hover:text-plasma',
  gold:   'bg-gold/10 border border-gold/40 text-gold hover:bg-gold hover:text-void',
};

const sizes = {
  sm: 'px-4 py-1.5 text-xs',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

export default function GlowButton({ children, variant = 'plasma', size = 'md', className, disabled, ...props }) {
  return (
    <button
      disabled={disabled}
      className={clsx(
        'rounded-xl font-dm font-medium tracking-wide transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100',
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {children}
    </button>
  );
}