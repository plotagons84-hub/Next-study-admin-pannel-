/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: {
          DEFAULT: '#08080A',
          800: '#0E0E10',
          700: '#161615',
        },
        glass: {
          border: 'rgba(255,255,255,0.14)',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        glass: '0 8px 32px -8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.16)',
        'glass-lg': '0 24px 64px -16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.18)',
        glow: '0 0 0 1px rgba(255,255,255,0.08), 0 0 40px -8px rgba(249,115,22,0.55)',
      },
      borderRadius: {
        xl2: '1.5rem',
        xl3: '2rem',
      },
      keyframes: {
        drift: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(3%, -4%) scale(1.08)' },
        },
        driftSlow: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '50%': { transform: 'translate(-4%, 3%) scale(1.05)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.92) translateY(12px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        bounceY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        spinSlow: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        loadingBar: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
      },
      animation: {
        drift: 'drift 16s ease-in-out infinite',
        'drift-slow': 'driftSlow 22s ease-in-out infinite',
        'fade-in-up': 'fadeInUp 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'pop-in': 'popIn 0.35s cubic-bezier(0.16,1,0.3,1) both',
        'bounce-y': 'bounceY 1.8s ease-in-out infinite',
        'spin-slow': 'spinSlow 3.2s linear infinite',
        'pulse-glow': 'pulseGlow 1.6s ease-in-out infinite',
        shake: 'shake 0.45s ease-in-out',
        'loading-bar': 'loadingBar 1.7s ease-out forwards',
      },
    },
  },
  plugins: [],
}
