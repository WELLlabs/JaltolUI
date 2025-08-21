// tailwind.config.js

/**
 * @type {import('tailwindcss').Config}
 */
const config = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        'primary-foreground': 'var(--color-primary-foreground)',
        accent: 'var(--color-accent)',
        info: 'var(--color-info)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        danger: 'var(--color-danger)',
        'navy-800': 'var(--color-navy-800)',
        'navy-300': 'var(--color-navy-300)',
        'brown-600': 'var(--color-brown-600)',
        surface: 'var(--color-surface)',
        'surface-variant': 'var(--color-surface-variant)',
        outline: 'var(--color-outline)'
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)']
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)'
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)'
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};

export default config;
