import * as fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

import { build as buildApp } from "vite";
import { build as buildDocs } from "vitepress";

const root = new URL("../", import.meta.url);

// Merges the app and docs builds into a single Vercel output.
// https://vercel.com/docs/build-output-api/v3
async function main() {
  await buildApp({
    root: fileURLToPath(root),
  });

  await buildDocs(fileURLToPath(new URL("./docs/", root)));

  const output = new URL("./.vercel/output/", root);
  await fs.rm(output, { recursive: true, force: true });
  await fs.mkdir(output, { recursive: true });

  await fs.rename(new URL("./dist/", root), new URL("./static/", output));
  await fs.rename(new URL("./docs/.vitepress/dist/", root), new URL("./static/docs/", output));

  const config = {
    version: 3,
    cache: ["node_modules/**"],
    routes: [
      { src: "^/(.*)/$", headers: { Location: "/$1" }, status: 308 },
      { handle: "filesystem" },
      { status: 404, src: "^(?!/api).*$", dest: "/docs/404.html" },
    ],
  };

  await fs.writeFile(new URL("./config.json", output), JSON.stringify(config, null, 2));
}

main()
  .then(() => console.log("Build successful"))
  .catch(err => console.error(err));
