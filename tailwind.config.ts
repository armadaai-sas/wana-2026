import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './utils/**/*.{js,ts,jsx,tsx}',
    './actions/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        wana: {
        forest: '#0D3B2E',
          'forest-light': '#1B5E4A',
          'forest-deep': '#0A2A22',
          emerald: '#1B5E4A',
          'emerald-deep': '#0D3B2E',
          'emerald-light': '#2A7A5F',
          midnight: '#0B1120',
          'midnight-soft': '#151C2F',
          champagne: '#D4AF7A',
          'champagne-light': '#E8D5B5',
          'champagne-dark': '#B8956B',
          accent: '#1B5E4A',
          'accent-deep': '#0D3B2E',
          cream: '#FAF7F2',
          sand: '#EDE8DF',
          gold: '#D4AF7A',
          'gold-light': '#E8D5B5',
          charcoal: '#1A1F1C',
          muted: '#6B7280',
          border: '#E5E0D6',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-dm-serif)', 'Georgia', 'serif'],
      },
      boxShadow: {
        wana: '0 6px 20px rgba(15, 23, 42, 0.08)',
        'wana-lg': '0 20px 50px rgba(15, 23, 42, 0.12)',
        card: '0 2px 8px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
