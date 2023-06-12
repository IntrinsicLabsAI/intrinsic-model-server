/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    colors: {
      primary: {
        600: '#34ae8e',
        500: '#53b79a',
        400: '#6cc0a6',
        300: '#83cab2',
        200: '#98d3bf',
        100: '#addccb',
      },
      white: '#FFFFFF',
      black: '#111418',
      dark: {
        100: '#1C2127',
        200: '#252A31',
        300: '#2F343C',
        400: '#383E47',
        500: '#404854',
      },
      gray: {
        100: '#404854',
        200: '#DCE0E5',
        300: '#E5E8EB',
        400: '#F6F7F9',
        500: '#FAFBFC',
      }
    },
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}