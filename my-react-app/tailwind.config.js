/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#052E19',
          50: '#E6EDE9',
          100: '#CCDBD3',
          200: '#99B7A7',
          300: '#66937B',
          400: '#336F4F',
          500: '#052E19',
          600: '#042514',
          700: '#031C0F',
          800: '#02130A',
          900: '#010A05'
        },
        dark: '#331108',
        light: '#37F568',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
};
