// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oxfordBlue: '#002147',  // primary dark blue
        charcoalGray: '#333333',
        darkGold: '#BFA200',
        gentleGray: '#ECEBE5',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
