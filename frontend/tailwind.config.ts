import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme (Duolingo actual)
        'duo-bg': '#131f24',
        'duo-bg-card': '#1f3239',
        'duo-bg-card2': '#172631',
        'duo-border': '#2a4255',
        'duo-text': '#ffffff',
        'duo-text-muted': '#6b8fa3',

        // Brand colors
        'duo-green': '#58CC02',
        'duo-green-dark': '#46A302',
        'duo-green-hover': '#61e002',
        'duo-blue': '#1CB0F6',
        'duo-blue-dark': '#1899D6',
        'duo-red': '#FF4B4B',
        'duo-red-dark': '#EA2B2B',
        'duo-gold': '#FFD900',
        'duo-gold-dark': '#E0B800',
        'duo-orange': '#FF9600',
        'duo-purple': '#9B59B6',
        'duo-purple-light': '#CE82FF',
      },
      fontFamily: {
        'sans': ['Nunito', 'sans-serif'],
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(88, 204, 2, 0.5)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 0 10px rgba(88, 204, 2, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 0 rgba(88, 204, 2, 0)' },
        }
      },
      animation: {
        'slide-up': 'slide-up 0.25s ease-out forwards',
        'bounce-in': 'bounce-in 0.4s cubic-bezier(0.36, 0.07, 0.19, 0.97)',
        'fade-in': 'fade-in 0.3s ease-out',
        'pulse-ring': 'pulse-ring 1.5s infinite',
      }
    },
  },
  plugins: [],
};
export default config;
