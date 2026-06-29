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
          forest: '#152E26',
          'forest-light': '#1F4D3A',
          'forest-deep': '#0F1F18',
          midnight: '#0B1120',
          'midnight-soft': '#151C2F',
          accent: '#38BDF8',
          'accent-deep': '#6366F1',
          cream: '#FAF7F2',
          sand: '#EDE8DF',
          gold: '#C4A574',
          'gold-light': '#E8DCC8',
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
