/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        breath: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.4' },
          '50%': { transform: 'scale(1.4)', opacity: '0.8' },
        }
      },
      animation: {
        breath: 'breath 1s ease-in-out infinite', // 6 sekund na pełny wdech i wydech
      }
    },
  },
  plugins: [],
}