/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50: '#FFF2F4',
          100: '#FFE0E4',
          200: '#FFC6CD',
          300: '#FF9EA8',
          400: '#FF6B7C',
          500: '#FF385C',
          600: '#E81C4A',
          700: '#C4103C',
          800: '#A31035',
          900: '#8B1331',
        },
        air: {
          black: '#222222',
          gray: '#717171',
          light: '#F7F7F7',
          border: '#DDDDDD',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'air': '24px',
        'pill': '999px',
      },
      boxShadow: {
        'air': '0 6px 20px rgba(0, 0, 0, 0.08)',
        'air-lg': '0 12px 40px rgba(0, 0, 0, 0.12)',
        'air-sm': '0 2px 8px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}