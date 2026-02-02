/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        'stockly-green': '#40dfaf',
        'stockly-blue': '#1b66a3',
        'stockly-teal': '#14b8a6',
        'stockly-navy': '#0f172a',
      },
      backgroundImage: {
        'gradient-cover': 'linear-gradient(135deg, #f0f9ff 0%, #ecfdf5 100%)',
        'gradient-cover-dark': 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(64, 223, 175, 0.3)',
        'glow-lg': '0 0 30px rgba(64, 223, 175, 0.4)',
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
