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
          50: '#f0f8f5',
          100: '#d9eee8',
          200: '#b0ddd7',
          300: '#87ccc6',
          400: '#5ebbb5',
          500: '#35aaa4',
          600: '#2a8a87',
          700: '#1f6a6a',
          800: '#164a4d',
          900: '#0d2a30',
          DEFAULT: '#006A4E', // NDM Green
          dark: '#004d38',
          light: '#00835f',
        },
        accent: {
          50: '#fff5f5',
          100: '#ffe5e5',
          200: '#ffcccc',
          300: '#ffb3b3',
          400: '#ff9999',
          500: '#ff8080',
          600: '#dc143c',
          700: '#b01030',
          800: '#8a0a27',
          900: '#64051f',
          DEFAULT: '#DC143C', // Crimson Red
          dark: '#b01030',
        },
        gold: {
          50: '#fffef0',
          100: '#fffcde',
          200: '#fff9bd',
          300: '#fff69c',
          400: '#fff37b',
          500: '#F0C040', // Golden Yellow
          600: '#d9a835',
          700: '#b2902a',
          800: '#8b7820',
          900: '#645918',
          DEFAULT: '#F0C040',
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 106, 78, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'card-hover': '0 10px 15px rgba(0, 106, 78, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)',
        'accent': '0 4px 20px rgba(220, 20, 60, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
    },
  },
  plugins: [],
}
