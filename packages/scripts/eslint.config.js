import { vonsim } from "eslint-config-vonsim";
import globals from "globals";

export default vonsim(
  { gitignore: new URL("./.gitignore", import.meta.url) },
  {
    files: ["src/**/*.{js,ts}"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
);
