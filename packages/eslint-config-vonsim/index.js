import { fileURLToPath } from "node:url";

import { includeIgnoreFile } from "@eslint/compat";
import eslint from "@eslint/js";

import importPlugin from "eslint-plugin-import";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import * as regexpPlugin from "eslint-plugin-regexp";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

/**
 * @param {object} options
 * @param {URL} options.gitignore
 * @param {import("eslint").Linter.Config[]} extras
 * @returns {import("eslint").Linter.Config}
 */
export function vonsim({ gitignore }, ...extras) {
  return tseslint.config(
    includeIgnoreFile(fileURLToPath(gitignore)),
    eslint.configs.recommended,
    tseslint.configs.strict,
    tseslint.configs.stylistic,
    regexpPlugin.configs["flat/recommended"],
    {
      files: ["**/*.{js,ts,tsx}"],
      languageOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      plugins: {
        import: importPlugin,
        "simple-import-sort": simpleImportSort,
      },
      rules: {
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/consistent-type-definitions": "off",
        "import/first": "error",
        "import/newline-after-import": "error",
        "import/no-anonymous-default-export": "warn",
        "import/no-duplicates": "error",
        "simple-import-sort/exports": "error",
        "simple-import-sort/imports": "error",
      },
    },
    {
      files: ["test/**/*.{js,ts,tsx}", "eslint.config.js"],
      languageOptions: {
        globals: { ...globals.node },
      },
    },
    ...extras,
    eslintPluginPrettierRecommended, // Must be last
  );
}
