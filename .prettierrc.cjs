/** @type{import('prettier').Config} */
module.exports = {
  printWidth: 100,
  arrowParens: "avoid",
  trailingComma: "all",
  semi: true,
  singleQuote: false,
  jsxSingleQuote: false,
  tabWidth: 2,
  plugins: [
    require.resolve("prettier-plugin-tailwindcss"), // MUST come last
  ],
  pluginSearchDirs: false,
  tailwindConfig: "./tailwind.config.ts",
};
