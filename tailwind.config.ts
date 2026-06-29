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
          black: '#0A0A0A',
          'black-soft': '#141414',
          'black-elevated': '#1A1A1A',
          'gray-light': '#F0EFED',
          gray: '#A8A8A8',
          forest: '#0D3B2E',
          'forest-light': '#1B5E4A',
          'forest-deep': '#0A2A22',
          champagne: '#D4AF7A',
          'champagne-light': '#E8D5B5',
          'champagne-dark': '#B8956B',
          cream: '#FAF9F7',
          sand: '#ECEAE6',
          gold: '#D4AF7A',
          'gold-light': '#E8D5B5',
          charcoal: '#1A1A1A',
          muted: '#737373',
          border: '#E5E3DF',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-dm-serif)', 'Georgia', 'serif'],
      },
      boxShadow: {
        wana: '0 6px 20px rgba(0, 0, 0, 0.08)',
        'wana-lg': '0 20px 50px rgba(0, 0, 0, 0.12)',
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
