const colors = require('tailwindcss/colors')

module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    colors: {
      white: "#ffffff",
      black: "#282b2f",
      textBlack: "#212529",
      lightGray: "#f7f7f7",
      borderGray: "#dedede",
      blue: "#4b7bea",
      light: "#edf2fd",
      mainColor: "#e54b39",
      gray: colors.coolGray
    },
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
