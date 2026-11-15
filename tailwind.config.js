/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1A1A1A',
        panel: '#2A2A2A',
        orange: '#FF6E1F',
        orangeDeep: '#FF4D00',
        orangeSoft: '#FFB088',
        violet: '#7C3AED',
        lilac: '#A855F7',
        pink: '#EC4899',
        mist: '#A1A1AA'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
