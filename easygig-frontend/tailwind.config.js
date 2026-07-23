/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        easygig: {
          dark: '#090d16',      // Deep obsidian dark
          surface: '#111622',   // Primary card background
          elevated: '#1a2030',  // Hover / elevated panel
          border: '#242b3d',    // Crisp 1px border
          accent: {
            DEFAULT: '#4f46e5',
            hover: '#4338ca',
            light: '#6366f1',
          },
          strike: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
        }
      },
      backgroundImage: {
        'gradient-subtle': 'linear-gradient(180deg, rgba(79, 70, 229, 0.08) 0%, rgba(9, 13, 22, 0) 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(26, 32, 48, 0.6) 0%, rgba(17, 22, 34, 0.9) 100%)',
        'gradient-brand': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      },
      boxShadow: {
        'studio': '0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'glow-subtle': '0 0 30px -5px rgba(79, 70, 229, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}