import { vonsim } from "eslint-config-vonsim";

export default vonsim({
  gitignore: new URL("./.gitignore", import.meta.url),
});
