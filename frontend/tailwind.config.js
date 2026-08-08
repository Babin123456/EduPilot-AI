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
        'adamas-blue': '#005BAC',
        'adamas-blue-light': '#0A6FD8',
        'adamas-green': '#8CC63F',
        'adamas-green-light': '#6FAF2E',
        'adamas-bg': '#F8FAFC',
        'adamas-bg-dark': '#0F172A',
        'adamas-card-dark': '#1E293B',
        adamas: {
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

