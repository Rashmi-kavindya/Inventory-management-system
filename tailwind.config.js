/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        'stockly-green': '#40dfaf',
        'stockly-blue': '#1b66a3', 
      },
      backgroundImage: {
        'gradient-cover': 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        'gradient-cover-dark': 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
      },
    },
  },
  plugins: [],
};