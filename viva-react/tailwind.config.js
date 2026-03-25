/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#006A4E', // NDM Green
          dark: '#004d38',
          light: '#00835f',
        },
        accent: {
          DEFAULT: '#DC143C', // Crimson Red
          dark: '#b01030',
        },
        gold: {
          DEFAULT: '#F0C040', // Golden Yellow
        },
      },
    },
  },
  plugins: [],
}
