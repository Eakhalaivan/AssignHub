/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: 'var(--bg-void)',
        deep: 'var(--bg-void)',
        surface: 'var(--bg-elevated)',
        elevated: 'var(--bg-elevated)',
        plasma: 'var(--plasma)',
        orbit: 'var(--orbit)',
        alert: 'var(--alert)',
        warning: 'var(--warning)',
        success: 'var(--success)',
        border: 'var(--border-primary)',
        'border-glow': 'var(--border-glow)',
        muted: 'var(--text-muted)',
        secondary: 'var(--text-secondary)',
        
        // Mockup specific overrides
        'surface-container-low': '#1b1b1b',
        'surface-variant': '#353535',
        'surface-container-high': '#2a2a2a',
        'surface-container': '#20201f',
        'primary-container': '#9b1b30',
        'on-surface': '#e5e2e1',
        'on-surface-variant': '#e0bfbf',
        'surface-container-highest': '#353535',
        'outline-variant': '#584141',
        'surface-container-lowest': '#0e0e0e',
      },
      fontFamily: {
        orbitron: ['Plus Jakarta Sans', 'sans-serif'], // Sora replaced by Plus Jakarta Sans for headers
        dm: ['Inter', 'sans-serif'], // Hanken Grotesk replaced by Inter for body
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      animation: {
        'fade-up':      'fadeUp 0.3s ease forwards',
        'slide-in':     'slideIn 0.25s ease forwards',
        'shimmer':      'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to:   { opacity: 1, transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: 0, transform: 'translateX(-8px)' },
          to:   { opacity: 1, transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'premium': '0 12px 40px rgba(0, 0, 0, 0.25)',
      },
    },
  },
  plugins: [],
};