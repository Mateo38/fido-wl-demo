/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wl: {
          dark: '#1B1C1E',
          teal: '#277777',
          'teal-light': 'rgba(39, 119, 119, 0.15)',
          'teal-hover': '#1F5F5F',
          gray: '#9CA3AF',
          'gray-dark': '#D1D5DB',
          surface: '#1F2937',
          'surface-light': '#374151',
        },
      },
      borderRadius: {
        wl: '1.2rem',
      },
    },
  },
  plugins: [],
};
