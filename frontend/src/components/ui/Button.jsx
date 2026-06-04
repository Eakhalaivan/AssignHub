import { motion } from 'framer-motion';
import clsx from 'clsx';

export function Button({ 
  children, 
  variant = 'secondary', 
  size = 'md', 
  className, 
  disabled, 
  loading, 
  onClick,
  type = 'button',
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center font-orbitron font-semibold tracking-wider transition-all duration-200 select-none outline-none focus:ring-1 focus:ring-plasma/50';
  
  const variants = {
    primary: 'bg-[#c5a880] text-[#09090b] hover:bg-[#b0936b] disabled:bg-[#c5a880]/40 disabled:text-[#09090b]/60',
    secondary: 'bg-[#111113] text-secondary border border-border hover:text-white hover:bg-[#18181b] disabled:bg-[#111113]/40 disabled:text-muted',
    plasma: 'bg-[#c5a880]/10 border border-[#c5a880]/30 text-[#c5a880] hover:bg-[#c5a880]/20 hover:border-[#c5a880]/50 disabled:bg-[#c5a880]/5 disabled:border-[#c5a880]/10 disabled:text-[#c5a880]/40',
    orbit: 'bg-zinc-800 border border-zinc-700 text-primary hover:bg-zinc-700 hover:border-zinc-600 disabled:bg-zinc-900/50 disabled:border-zinc-800 disabled:text-muted',
    alert: 'bg-alert/10 border border-alert/30 text-alert hover:bg-alert/20 hover:border-alert/50 disabled:bg-alert/5 disabled:border-alert/10 disabled:text-alert/40',
    ghost: 'bg-transparent text-muted hover:text-secondary hover:bg-white/5 disabled:bg-transparent disabled:text-muted/40',
    outline: 'border border-border text-secondary hover:bg-white/5 hover:text-primary',
  };

  const sizes = {
    sm: 'text-[11px] px-3.5 py-1.5 rounded-sm uppercase tracking-widest',
    md: 'text-xs px-5 py-2.5 rounded-md uppercase tracking-wider',
    lg: 'text-xs px-6 py-3 rounded-md uppercase tracking-widest',
  };

  return (
    <motion.button
      type={type}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        (disabled || loading) && 'opacity-60 cursor-not-allowed pointer-events-none',
        className
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </motion.button>
  );
}

export function GlowButton({ children, variant = 'plasma', size = 'md', className, ...props }) {
  // Map to an elegant subtle gold-tinted secondary button for luxury feel, rather than bright glowing
  const borders = {
    plasma: 'border-[#c5a880]/30 hover:border-[#c5a880]/60 text-[#c5a880] hover:bg-[#c5a880]/5',
    orbit: 'border-zinc-700 hover:border-zinc-500 text-secondary hover:bg-zinc-800/40',
    alert: 'border-alert/30 hover:border-alert/60 text-alert hover:bg-alert/5',
  };

  return (
    <Button
      variant="ghost"
      size={size}
      className={clsx(
        'relative border bg-transparent transition-all duration-300 font-semibold',
        borders[variant],
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
