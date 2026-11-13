/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        void: '#0A0B0E',
        console: '#111318',
        parchment: '#F4F1EA',
        ink: '#141619',
        nasaOrange: '#FC3D21',
        kaptonGold: '#E5A93C',
        marsRust: '#C85A32',
        crtAmber: '#FFB000',
        crtGreen: '#33FF66',
      },
    },
  },
  plugins: [],
};
