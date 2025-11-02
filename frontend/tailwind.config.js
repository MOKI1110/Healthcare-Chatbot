// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // PRIMARY (60% - Teal)
        primary: {
          50: '#E6F5F5',
          100: '#CCF0F0',
          200: '#99E0E0',
          300: '#66D1D1',
          400: '#33C1C1',
          500: '#008080', // Base teal
          600: '#006666',
          700: '#004D4D',
          800: '#003333',
          900: '#001A1A',
        },
        // SECONDARY (30% - Neutral)
        secondary: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        // ACCENT (10%)
        accent: {
          orange: '#FF6B35',
          red: '#E63946',
          green: '#06D6A0',
          yellow: '#FFD166',
        },
      },
      animation: {
        marquee: 'marquee 18s linear infinite',
        fadeIn: 'fadeIn 0.3s ease',
        bounce: 'bounce 1s infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
