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
          dark: '#1e293b',
          accent: '#6366f1',
          strike: '#ef4444',
          warning: '#f59e0b',
          success: '#10b981',
        }
      }
    },
  },
  plugins: [],
}