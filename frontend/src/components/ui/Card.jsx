import { motion } from 'framer-motion';
import clsx from 'clsx';

export function Card({ 
  children, 
  className, 
  animate = true, 
  glow = false,
  onClick,
  hover = false,
  ...props 
}) {
  const Component = animate ? motion.div : 'div';
  
  // Clean, premium subtle animations
  const animationProps = animate && onClick ? {
    whileHover: { y: -2, transition: { duration: 0.2 } },
    whileTap: { scale: 0.99 }
  } : {};

  return (
    <Component
      onClick={onClick}
      className={clsx(
        'glass rounded-md p-5 border border-white/5 relative overflow-hidden transition-all duration-300',
        (hover || onClick) && 'hover:bg-[#18181b] hover:border-zinc-700',
        onClick && 'cursor-pointer',
        className
      )}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  );
}

export function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendDirection = 'up', // 'up' | 'down' | 'neutral'
  glow = false,
  loading = false,
  icon,
  className,
  ...props
}) {
  return (
    <Card 
      glow={glow} 
      animate={false}
      className={clsx('relative p-6 flex flex-col justify-between min-h-[110px] bg-[#111113] border-white/5', className)}
      {...props}
    >
      {loading ? (
        <div className="space-y-3.5 w-full">
          <div className="h-2 bg-white/5 rounded skeleton w-1/3" />
          <div className="h-6 bg-white/5 rounded skeleton w-2/3" />
          <div className="h-2 bg-white/5 rounded skeleton w-1/2" />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <span className="text-muted text-[10px] font-mono uppercase tracking-widest block font-medium">
              {title}
            </span>
            {icon && <div className="text-[#c5a880] text-sm">{icon}</div>}
          </div>
          
          <div className="mt-2.5">
            <h3 className="font-orbitron font-semibold text-2xl tracking-tight text-[#fafafa]">
              {value}
            </h3>
          </div>

          <div className="flex items-center justify-between mt-3 border-t border-white/5 pt-2">
            {subtitle && <span className="text-[10px] font-dm text-muted uppercase tracking-wider">{subtitle}</span>}
            {trend && (
              <span
                className={clsx(
                  'text-[10px] font-mono font-medium flex items-center gap-0.5',
                  trendDirection === 'up' && 'text-[#70a382]',
                  trendDirection === 'down' && 'text-[#cb6e6e]',
                  trendDirection === 'neutral' && 'text-muted'
                )}
              >
                {trendDirection === 'up' && '▲'}
                {trendDirection === 'down' && '▼'}
                {trend}
              </span>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
