import { motion } from 'framer-motion';
import clsx from 'clsx';

export default function OrderStatusStepper({ status = 'PENDING' }) {
  const getStepIndex = (s) => {
    switch (s?.toUpperCase()) {
      case 'PENDING': return 0;
      case 'ASSIGNED': return 1;
      case 'IN_PROGRESS': return 2;
      case 'DELIVERED': return 3;
      case 'COMPLETED': return 4;
      default: return -1;
    }
  };

  const steps = [
    { label: 'Placed', desc: 'Geo-matching...' },
    { label: 'Matched', desc: 'Writer assigned' },
    { label: 'Writing', desc: 'Work in progress' },
    { label: 'Review', desc: 'Draft ready' },
    { label: 'Done', desc: 'Complete!' }
  ];

  const currentStep = getStepIndex(status);

  return (
    <div className="w-full bg-void/45 border border-white/5 p-5 rounded-2xl select-none relative overflow-hidden glass">
      {/* Background radial highlight */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-plasma/5 blur-2xl pointer-events-none rounded-full" />
      
      <div className="flex justify-between items-center mb-5.5">
        <span className="text-[10px] font-mono text-muted uppercase tracking-widest block font-bold">
          ORDER MATCHING ENGINE PIPELINE
        </span>
        <span className="text-[10.5px] font-orbitron font-extrabold text-plasma animate-pulse uppercase tracking-wider">
          STATUS: {status?.replace('_', ' ')}
        </span>
      </div>

      {/* Glowing horizontal step progress */}
      <div className="relative flex justify-between items-center w-full px-2.5">
        {/* Progress connecting line */}
        <div className="absolute left-6 right-6 top-3.5 h-[1.5px] bg-white/5 z-0" />
        
        {/* Filled active progress line */}
        {currentStep > 0 && (
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 92}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute left-6 h-[1.5px] bg-plasma shadow-[0_0_8px_rgba(99,102,241,0.5)] z-0"
          />
        )}
 
        {steps.map((st, idx) => {
          const isActive = idx <= currentStep;
          const isCurrent = idx === currentStep;
          return (
            <div key={st.label} className="flex flex-col items-center z-10 relative">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={isCurrent ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={isCurrent ? { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } : {}}
                className={clsx(
                  'w-7.5 h-7.5 rounded-full flex items-center justify-center border font-mono text-[10px] font-bold transition-all duration-300',
                  isCurrent
                    ? 'bg-plasma text-white border-plasma shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                    : isActive
                    ? 'bg-orbit text-white border-orbit shadow-[0_0_8px_rgba(79,70,229,0.5)]'
                    : 'bg-void text-muted border-white/10'
                )}
              >
                {idx + 1}
              </motion.div>
              <span
                className={clsx(
                  'text-[9.5px] font-sans font-bold uppercase tracking-wider mt-2.5',
                  isCurrent ? 'text-plasma text-glow-plasma' : isActive ? 'text-orbit' : 'text-muted'
                )}
              >
                {st.label}
              </span>
              <span className="text-[8px] font-mono text-muted uppercase mt-0.5 max-w-[80px] text-center hidden md:block">
                {st.desc}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
