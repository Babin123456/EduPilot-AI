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
        adamas: {
          blue: {
            DEFAULT: '#0060B5',
            dark: '#004A8D',
            light: '#E6F0FA',
          },
          green: {
            DEFAULT: '#8CC63F',
            dark: '#74B72E',
            light: '#F2F9E8',
          }
        }
      }
    },
  },
  plugins: [],
}
