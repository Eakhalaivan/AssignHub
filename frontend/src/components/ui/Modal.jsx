import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { modalScale, drawerSlide } from '../../animations/presets';
import clsx from 'clsx';

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showClose = true
}) {
  // Close on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-sm pointer-events-auto"
          />

          {/* Modal Container */}
          <motion.div
            variants={modalScale}
            initial="initial"
            animate="animate"
            exit="exit"
            className={clsx(
              'w-full bg-[#111113] border border-white/5 rounded-md shadow-premium relative overflow-hidden flex flex-col max-h-[90vh] z-10',
              sizes[size]
            )}
          >
            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-center justify-between px-6 py-4.5 border-b border-white/5 bg-[#09090b]/40">
                {title ? (
                  <h3 className="font-orbitron text-xs font-semibold tracking-wider text-[#c5a880] uppercase">
                    {title}
                  </h3>
                ) : <div />}
                {showClose && (
                  <button 
                    onClick={onClose} 
                    className="text-muted hover:text-white transition-colors p-1"
                    aria-label="Close dialog"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 p-6 overflow-y-auto select-text">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  size = 'md'
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-xs',
    md: 'max-w-md',
    lg: 'max-w-xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-sm pointer-events-auto"
          />

          {/* Drawer Wrapper */}
          <motion.div
            variants={drawerSlide}
            initial="initial"
            animate="animate"
            exit="exit"
            className={clsx(
              'w-full h-full bg-[#111113] border-l border-white/5 shadow-premium z-10 flex flex-col',
              sizes[size]
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/5 bg-[#09090b]/40">
              {title && (
                <h3 className="font-orbitron text-xs font-semibold tracking-wider text-[#c5a880] uppercase">
                  {title}
                </h3>
              )}
              <button onClick={onClose} className="text-muted hover:text-white transition-colors p-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
