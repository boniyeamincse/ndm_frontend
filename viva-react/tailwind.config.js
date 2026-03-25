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
          DEFAULT: '#006A4E',
          dark: '#004d38',
          light: '#00835f',
        },
        accent: {
          DEFAULT: '#DC143C',
          dark: '#b01030',
        },
        gold: '#F0C040',
      },
    },
  },
  plugins: [],
}
