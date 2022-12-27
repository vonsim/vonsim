const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/simulator/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter var"', ...defaultTheme.fontFamily.sans],
        mono: ['"FiraCode VF"', ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [require("@headlessui/tailwindcss")],
};
