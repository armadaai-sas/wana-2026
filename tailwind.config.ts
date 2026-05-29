import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Look Airbnb-Moderno: Neutros + Acentos de Lujo
        canvas: { DEFAULT: "#FFFFFF", dark: "#0A0A0A" },
        emerald: { DEFAULT: "#064E3B" }, // Acento de autoridad
        gold: { DEFAULT: "#C5A059" },     // Acento de exclusividad
      },
      transitionTimingFunction: {
        'wana-smooth': 'cubic-bezier(0.23, 1, 0.32, 1)',
      },
    },
  },
  plugins: [],
};
export default config;
