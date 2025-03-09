import globals from "globals";
import { vonsim } from "eslint-config-vonsim";

export default vonsim(
  { gitignore: new URL("./.gitignore", import.meta.url) },
  {
    files: ["src/**/*.{js,ts}"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
);
