/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'sans-serif'], mono: ['JetBrains Mono', 'Fira Code', 'monospace'] },
      colors: { 'gray-950': '#030712', 'gray-925': '#060b14' },
    },
  },
  plugins: [],
}
