/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF8F3",
        ink: "#242A25",
        forest: { 50: "#EDF3EC", 100: "#DCE6D9", 700: "#285A46", 800: "#204937", 900: "#173C2E" },
        line: "#DEDCD2",
      },
    },
  },
  plugins: [],
}
