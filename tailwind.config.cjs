const defaultTheme = require("tailwindcss/defaultTheme");
const { addDynamicIconSelectors } = require("@iconify/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/ui/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter var"', ...defaultTheme.fontFamily.sans],
        mono: ['"FiraCode VF"', ...defaultTheme.fontFamily.mono],
      },

      colors: {
        accent: "var(--color-accent)",
      },
    },
  },
  plugins: [require("@headlessui/tailwindcss"), addDynamicIconSelectors()],
};
