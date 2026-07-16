/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        mint: {
          50: '#f6fffa',
          100: '#ecfdf5',
          200: '#d1fae5',
          300: '#a7f3d0',
          400: '#6ee7b7',
          500: '#34d399',
        },
        teal: {
          text: '#0f4c3a',
          muted: '#4a7c6f',
          light: '#6b9b8f',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 4px 20px rgba(34, 197, 94, 0.08)',
        card: '0 2px 12px rgba(15, 76, 58, 0.06)',
        hover: '0 8px 30px rgba(34, 197, 94, 0.15)',
      },
    },
  },
  plugins: [],
}
