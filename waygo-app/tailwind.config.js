/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        waygo: {
          // Light theme surfaces (replaces old dark theme)
          dark: '#FFFFFF',        // main bg → white
          darkMid: '#F5F5FF',     // card bg → ghost white
          darkLight: '#EAEAF8',   // input/chip bg → soft lavender
          // Rainbow accent palette (matching the map image)
          teal: '#00C4B8',
          tealDark: '#009A90',
          amber: '#FF8C42',
          amberDark: '#E67530',
          pink: '#FF90B5',
          lavender: '#B090FF',
          sky: '#7AC8FF',
          mint: '#78E8C8',
          peach: '#FFB878',
          rose: '#FFB0C8',
          // Text colors for light bg
          text: '#1A1A3E',
          textMid: '#5858A0',
          textSoft: '#9898C0',
          // Borders
          border: '#E0E0F5',
          borderLight: '#F0F0FF',
        }
      },
      backgroundImage: {
        'rainbow': 'linear-gradient(135deg, #FFB0C8 0%, #C8A0FF 35%, #88C8FF 65%, #78E8C8 100%)',
        'rainbow-soft': 'linear-gradient(135deg, #FFD0E0 0%, #E0D0FF 35%, #C0E0FF 65%, #C0F5E8 100%)',
        'rainbow-vivid': 'linear-gradient(135deg, #FF90B5, #B090FF, #7AC8FF, #78E8C8)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s ease-in-out infinite',
        'xp-fly': 'xp-fly 1.5s ease-out forwards',
        'bounce-in': 'bounce-in 0.6s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'rainbow-shift': 'rainbow-shift 4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-ring': { '0%, 100%': { transform: 'scale(1)', opacity: '1' }, '50%': { transform: 'scale(1.3)', opacity: '0.5' } },
        'xp-fly': { '0%': { transform: 'translateY(0) scale(1)', opacity: '1' }, '100%': { transform: 'translateY(-80px) scale(1.5)', opacity: '0' } },
        'bounce-in': { '0%': { transform: 'scale(0)', opacity: '0' }, '50%': { transform: 'scale(1.2)' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        'slide-up': { '0%': { transform: 'translateY(100%)' }, '100%': { transform: 'translateY(0)' } },
        'rainbow-shift': { '0%, 100%': { 'background-position': '0% 50%' }, '50%': { 'background-position': '100% 50%' } },
      },
    },
  },
  plugins: [],
}
