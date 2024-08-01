// @ts-check

import { sidebarInstructions } from "../shared";

/** @type {import("vitepress").LocaleSpecificConfig<import("vitepress").DefaultTheme.Config>} */
export const en = {
  // Most of the configuration is in the root config file, this file only contains the locale-specific configuration

  lang: "en",
  themeConfig: {
    sidebar: {
      "/en/": {
        base: "/en/",
        items: [],
      },
    },
  },
};
