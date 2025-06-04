/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500',
    'bg-lime-500',
    'bg-emerald-500',
    'bg-rose-500',
    'bg-violet-500',
    'bg-amber-500',
    'bg-stone-500',
    'bg-gray-300', 
    'bg-orange-200',
    'bg-red-200',
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
}
