/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#021B43',
          50: '#E8EAF0',
          100: '#C5C9D9',
          200: '#9AA3BD',
          300: '#6B7899',
          400: '#3D4E75',
          500: '#021B43',
          600: '#01162F',
          700: '#01111E',
          800: '#000C12',
          900: '#000606',
        },
        accent: {
          DEFAULT: '#FF5001',
          50: '#FFF0E8',
          100: '#FFDCC6',
          200: '#FFC49E',
          300: '#FFA36E',
          400: '#FF6E2A',
          500: '#FF5001',
          600: '#CC4000',
          700: '#993000',
          800: '#662000',
          900: '#331000',
        },
        surface: '#F8F9FA',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
