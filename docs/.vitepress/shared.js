// @ts-check

import fs from "node:fs";

/**
 * @param {string} lang
 */
export function sidebarInstructions(lang) {
  const dir = new URL(`../${lang}/computer/instructions/`, import.meta.url);
  const files = fs.readdirSync(dir);
  return files
    .filter(f => f.endsWith(".md") && f !== "index.md")
    .map(f => {
      const name = f.slice(0, -3);
      return { text: name.toUpperCase(), link: `instructions/${name}` };
    });
}

/**
 * @param {import("vitepress").DefaultTheme.LocalSearchOptions["translations"]} translations
 * @returns {import("vitepress").DefaultTheme.Config["search"]}
 */
export function localSearch(translations = undefined) {
  return {
    provider: "local",
    options: { translations },
  };
}
