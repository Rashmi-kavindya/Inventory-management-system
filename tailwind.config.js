/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        'stockly-green': '#F4992A',
        'stockly-blue': '#442704',
        'stockly-teal': '#F7B564',
        'stockly-navy': '#180E01',
        'stockly-50': '#FEF3E7',
        'stockly-100': '#FBDFBB',
        'stockly-200': '#F9CA90',
        'stockly-300': '#F7B564',
        'stockly-400': '#F4992A',
        'stockly-500': '#F28B0D',
        'stockly-600': '#C7720A',
        'stockly-700': '#9B5908',
        'stockly-800': '#6F4006',
        'stockly-900': '#442704',
        'stockly-950': '#180E01',
      },
      backgroundImage: {
        'gradient-cover': 'linear-gradient(135deg, #FEF3E7 0%, #FBDFBB 100%)',
        'gradient-cover-dark': 'linear-gradient(135deg, #180E01 0%, #442704 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(244, 153, 42, 0.28)',
        'glow-lg': '0 0 30px rgba(244, 153, 42, 0.38)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
