import { vonsim } from "eslint-config-vonsim";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default vonsim(
  { gitignore: new URL("./.gitignore", import.meta.url) },
  {
    files: ["src/**/*.{js,ts,tsx}"],
    ...react.configs.flat.recommended,
    settings: {
      react: { version: "detect" },
    },
  },
  reactHooks.configs["recommended-latest"],
  {
    files: ["src/**/*.{js,ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser },
    },
    rules: {
      "react/no-unknown-property": "off",
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
    },
  },
);

/*
{
  "root": true,
  "parserOptions": {
    "ecmaFeatures": { "jsx": true }
  },
  "settings": {
    "react": { "version": "detect" },
    // https://github.com/francoismassart/eslint-plugin-tailwindcss#optional-shared-settings
    "tailwindcss": {
      "callees": ["clsx"],
      "config": "./tailwind.config.ts"
    }
  },
  "extends": [
    "vonsim",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:tailwindcss/recommended"
  ],
  "plugins": ["react", "react-hooks"],
  "rules": {
    "react/no-unknown-property": "off",
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off"
  }
}
*/
