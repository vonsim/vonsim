module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: "detect" },
  },
  env: { browser: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:regexp/recommended",
    "plugin:tailwindcss/recommended",
    "prettier",
  ],
  plugins: ["import", "simple-import-sort", "react", "react-hooks", "regexp"],
  rules: {
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-anonymous-default-export": "warn",
    "import/no-duplicates": "error",
    "react/no-unknown-property": "off",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "simple-import-sort/exports": "error",
    "simple-import-sort/imports": "error",
  },
  overrides: [
    {
      files: ["test/**/*.{js,ts,tsx}"],
      env: { node: true },
    },
    {
      files: ["*.cjs"],
      env: { node: true, commonjs: true },
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
