/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        easygig: {
          dark: '#0a0c10', // Deepest slate/black
          card: '#161920', // Card background
          accent: {
            DEFAULT: '#6366f1',
            hover: '#4f46e5',
            glow: 'rgba(99, 102, 241, 0.5)',
          },
          slate: {
            500: '#64748b',
            400: '#94a3b8',
            800: '#1e293b',
          },
          strike: '#ff4b5c',
          warning: '#ffb347',
          success: '#00d28a',
        }
      },
      backgroundImage: {
        'gradient-premium': 'linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%)',
        'gradient-dark': 'linear-gradient(180deg, rgba(22, 25, 32, 0) 0%, rgba(10, 12, 16, 1) 100%)',
      },
      borderRadius: {
        '4xl': '2.5rem',
        '5xl': '3rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'glow': 'glow 2s infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}