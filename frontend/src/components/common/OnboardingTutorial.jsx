import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export default function OnboardingTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('academix-onboarding-dismissed');
    if (!hasSeenOnboarding) {
      // Trigger onboarding modal after 1.5 seconds delay on first landing
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('academix-onboarding-dismissed', 'true');
    setIsOpen(false);
  };

  const steps = [
    {
      title: 'Welcome to Academix Mission Control',
      desc: 'You have entered the premium space-tech academic assistance platform. Let\'s walk through your operational command decks.',
      visual: '🚀'
    },
    {
      title: 'Real-time WriterMatch Radar',
      desc: 'Our canvas-pulsing radar scans your local coordinate radius to match you with top-performing academic operators instantly.',
      visual: '📡'
    },
    {
      title: 'Antigravity Credit Wallet',
      desc: 'Verify and authorize credit deposits under bank-grade security protocols. Instant payment validation ensures zero escrow delays.',
      visual: '💳'
    },
    {
      title: 'Secure Artifact Deliverables',
      desc: 'Once tasks are verified and compiled, directly retrieve your PDF/DOCX computational artifacts from your Specifications Deck.',
      visual: '📦'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-void/90 backdrop-blur-md">
          {/* Backdrop overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            onClick={handleDismiss}
          />

          {/* Onboarding Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="w-full max-w-lg glass-elevated rounded-2xl p-8 border-plasma/25 shadow-glow-plasma relative overflow-hidden select-none z-10"
          >
            {/* Background absolute highlights */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-plasma/5 blur-3xl pointer-events-none rounded-full" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orbit/5 blur-3xl pointer-events-none rounded-full" />

            <div className="flex flex-col items-center text-center">
              {/* Massive icon visual */}
              <motion.div 
                key={step}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="w-20 h-20 rounded-full bg-plasma/10 border border-plasma/25 flex items-center justify-center text-4xl mb-6 text-glow-plasma animate-float"
              >
                {steps[step].visual}
              </motion.div>

              <h2 className="font-orbitron font-black text-sm.5 tracking-widest text-plasma text-glow-plasma uppercase mb-3">
                {steps[step].title}
              </h2>
              
              <p className="text-secondary text-xs.5 leading-relaxed font-dm max-w-sm mb-8 min-h-[50px]">
                {steps[step].desc}
              </p>

              {/* Progress step dots */}
              <div className="flex gap-1.5 mb-6">
                {steps.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === step ? 'bg-plasma w-4.5 shadow-[0_0_6px_#00d4ff]' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 w-full justify-between items-center border-t border-white/5 pt-5">
                <button 
                  onClick={handleDismiss} 
                  className="text-muted hover:text-alert font-mono text-[10px] uppercase tracking-wider px-3.5 py-2 transition-colors"
                >
                  Skip Briefing
                </button>

                <div className="flex gap-2">
                  {step > 0 && (
                    <Button variant="secondary" size="sm" onClick={() => setStep(p => p - 1)}>
                      Back
                    </Button>
                  )}
                  {step < steps.length - 1 ? (
                    <Button variant="plasma" size="sm" onClick={() => setStep(p => p + 1)}>
                      Next Step
                    </Button>
                  ) : (
                    <Button variant="orbit" size="sm" onClick={handleDismiss} className="font-bold">
                      Enter Platform →
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
