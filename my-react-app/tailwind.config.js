/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Specific background colors
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
    'bg-gray-300', // for fallback/default
    
    // Custom colors
    'bg-ivory',
    'bg-cream',
    'bg-wine',
    'bg-darkorange',
    
    // Pattern for dynamic color generation
    {
      pattern: /bg-(red|blue|green|yellow|purple|pink|indigo|teal|orange|cyan|lime|emerald|rose|violet|amber|stone|gray|slate|neutral|zinc|sky|fuchsia|brown|maroon|coffee|wine|darkorange|cream|ivory)-(100|200|300|400|500|600|700|800|900)/,
    },
  ],
  theme: {
    extend: {
      animation: {
        'pulse-scale': 'pulse-scale 0.3s ease-in-out',
      },
      keyframes: {
        'pulse-scale': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      colors: {
        brown: {
          100: '#f3e5e1',
          200: '#e6ccc3',
          300: '#d9b2a4',
          400: '#cc9986',
          500: '#bf7f67',
          600: '#995f52',
          700: '#73403e',
          800: '#4d2019',
          900: '#260f0d',
        },
        maroon: {
          100: '#f3dede',
          200: '#e6bcbc',
          300: '#d99a9a',
          400: '#cc7878',
          500: '#bf5656',
          600: '#994545',
          700: '#733434',
          800: '#4d2323',
          900: '#261212',
        },
        coffee: {
          100: '#f4e6df',
          200: '#e9cdbf',
          300: '#deb39f',
          400: '#d39a7f',
          500: '#c8805f',
          600: '#a0654c',
          700: '#784b39',
          800: '#503026',
          900: '#281613',
        },
        ivory: '#FFFFF0',
        cream: '#FFFDD0',
        wine: '#722F37',
        darkorange: '#FF8C00',

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