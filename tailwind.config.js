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
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#0B63D6',
          600: '#0954b8',
          700: '#07449a',
          800: '#05357c',
          900: '#03265e',
        },
        accent: {
          DEFAULT: '#06A77D',
          50: '#ecfdf7',
          100: '#d1fae8',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#06A77D',
          600: '#059669',
          700: '#047857',
        },
        ink: {
          DEFAULT: '#0f172a',
          muted: '#64748b',
        },
      },
    },
  },
  plugins: [],
}

