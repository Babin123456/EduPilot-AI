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
        'brand-blue': '#005BAC',
        'brand-blue-light': '#0A6FD8',
        'brand-green': '#8CC63F',
        'brand-green-light': '#6FAF2E',
        'brand-bg': '#F8FAFC',
        'brand-bg-dark': '#0F172A',
        'brand-card-dark': '#1E293B',
        brand: {
          blue: {
            DEFAULT: '#005BAC',
            dark: '#0A6FD8',
            light: '#E6F0FA',
          },
          green: {
            DEFAULT: '#8CC63F',
            dark: '#6FAF2E',
            light: '#F2F9E8',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

