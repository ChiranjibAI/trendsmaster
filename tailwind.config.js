/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'monospace'],
      },
      colors: {
        zinc: {
          925: '#111113',
          950: '#09090b',
        },
        accent: {
          DEFAULT: '#10b981',
          dim: '#059669',
          glow: 'rgba(16,185,129,0.15)',
        },
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-400px 0' }, '100%': { backgroundPosition: '400px 0' } },
        fadeUp: { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'none' } },
        livePulse: {
          '0%,100%': { boxShadow: '0 0 0 0 rgba(16,185,129,0.4)' },
          '50%': { boxShadow: '0 0 0 5px rgba(16,185,129,0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s ease infinite',
        fadeUp: 'fadeUp 0.3s ease forwards',
        livePulse: 'livePulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
