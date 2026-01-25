/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#2C3E50', // Modern Dark Blue
        },
        accent: {
          saffron: '#F39C12', // Golden Orange
          green: '#138808',
        },
        neutral: {
          light: '#f5f5f5', // Light Grey
          dark: '#212121', // Dark Grey text
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        serif: ['Rubik', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
