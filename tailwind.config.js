/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#0B1F4D',
        brandBlue: '#155EEF',
        brandRed: '#E31E24',
        brandGreen: '#79BE28',
        canvas: '#F7F9FC',
        border: '#E5EAF2',
        ink: '#13213C',
        muted: '#667085',
      },
      boxShadow: {
        card: '0 8px 24px rgba(11,31,77,.05)',
      },
    },
  },
  plugins: [],
};
