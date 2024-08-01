// @ts-check

import fs from "node:fs";

export function sidebarInstructions() {
  const dir = new URL("../es/computer/instructions/", import.meta.url);
  const files = fs.readdirSync(dir);
  return files
    .filter(f => f.endsWith(".md") && f !== "index.md")
    .map(f => {
      const name = f.slice(0, -3);
      return { text: name.toUpperCase(), link: `instructions/${name}` };
    });
}
