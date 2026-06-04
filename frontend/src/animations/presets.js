export const pageTransition = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.3 } }
};

export const containerStagger = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const itemFadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
};

export const modalScale = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 25, stiffness: 350 } },
  exit: { opacity: 0, scale: 0.97, y: 8, transition: { duration: 0.2 } }
};

export const drawerSlide = {
  initial: { x: '100%' },
  animate: { x: 0, transition: { type: 'spring', damping: 28, stiffness: 320 } },
  exit: { x: '100%', transition: { duration: 0.25, ease: 'easeInOut' } }
};

export const hoverGlow = {
  whileHover: { 
    scale: 1.02, 
    borderColor: 'var(--plasma)',
    boxShadow: '0 0 20px rgba(0, 212, 255, 0.25)',
    transition: { duration: 0.2 }
  },
  whileTap: { scale: 0.99 }
};

export const hoverGlowSuccess = {
  whileHover: { 
    scale: 1.02, 
    borderColor: 'var(--orbit)',
    boxShadow: '0 0 20px rgba(6, 255, 165, 0.25)',
    transition: { duration: 0.2 }
  },
  whileTap: { scale: 0.99 }
};

export const pulseStatus = {
  animate: {
    scale: [1, 1.15, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};
