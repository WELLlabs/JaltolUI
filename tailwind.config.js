// tailwind.config.js

/**
 * @type {import('tailwindcss').Config}
 */
const config = {
  purge: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'jaltol-blue': '#4A69BC',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};

export default config;
