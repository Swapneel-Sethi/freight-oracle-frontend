export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sky: '#0B0E1A',
        charcoal: '#12141C',
        crimson: '#DC2626',
        ember: '#F59E0B',
        parchment: '#EDE6D6',
        ash: '#8B8FA3',
      },
      borderColor: {
        crimson: 'rgba(220, 38, 38, 0.35)',
      },
      borderRadius: {
        'xl': '14px',
      },
    },
  },
  plugins: [],
}