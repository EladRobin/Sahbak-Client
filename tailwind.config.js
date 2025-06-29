/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // אפשרות למצב חשוך לפי class "dark" ב-root
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "./node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@material-tailwind/react/components/**/*.{js,jsx,ts,tsx}",
    "./node_modules/@material-tailwind/react/theme/components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1D4ED8',     // כחול עיקרי
        secondary: '#9333EA',   // סגול
        accent: '#F59E0B',      // צהוב
        neutral: {
          100: '#F5F5F5',
          500: '#6B7280',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['"Open Sans"', 'ui-sans-serif', 'system-ui'],
        serif: ['"Merriweather"', 'ui-serif', 'Georgia'],
        mono: ['"Fira Code"', 'monospace'],
      },
      borderRadius: {
        'xl': '1rem',
      },
      boxShadow: {
        'custom-light': '0 4px 6px rgba(29, 78, 216, 0.1)',
        'custom-dark': '0 4px 6px rgba(147, 51, 234, 0.3)',
      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
};

