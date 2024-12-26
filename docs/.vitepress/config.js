// @ts-check

import { createMarkdownRenderer, defineConfig } from "vitepress";

import { generateOpenGraphs } from "./opengraph.js";
import { en } from "./locales/en.js";
import { es } from "./locales/es.js";
import { localSearch } from "./shared.js";
import vonsimLang from "./vonsim.tmLanguage.json";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "VonSim",
  titleTemplate: ":title | VonSim",
  description:
    "A 8088-like Assembly Simulator with multiple devices and functionality. Works on desktop and mobile.",
  lastUpdated: true,
  themeConfig: {
    editLink: { pattern: "https://github.com/vonsim/vonsim/edit/main/docs/:path" },
    externalLinkIcon: true,
    footer: {
      message: `This work is licensed under <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.`,
    },
    logo: "/logo.svg",
    nav: [{ text: "Simulator", link: "/" }],
    notFound: {
      code: "404",
      title: "PAGE NOT FOUND",
      quote: "Page not in cache. Or memory. Or anywhere, really.",
      linkLabel: "go to home",
      linkText: "JMP home",
    },
    search: localSearch(),
    socialLinks: [{ icon: "github", link: "https://github.com/vonsim/vonsim" }],
  },
  locales: {
    en: { ...en, label: "English" },
    es: { ...es, label: "Español" },
  },
  markdown: {
    // @ts-ignore
    languages: [vonsimLang],
  },
  head: [
    ["link", { rel: "icon", href: "/logo.svg" }],
    [
      "script",
      {
        async: "true",
        defer: "true",
        src: "https://umami.jms.ar/script.js",
        "data-website-id": "7ed03e0b-660d-4c86-ba49-1e58f5981823",
        "data-do-not-track": "true",
      },
    ],
    [
      "script",
      {
        defer: "true",
        "data-site-id": "vonsim.github.io",
        src: "https://assets.onedollarstats.com/tracker.js",
      },
    ],
  ],

  assetsDir: "assets/docs",
  ignoreDeadLinks: true, // Until english is fully translated

  async transformHead({ pageData, siteConfig }) {
    const titleTemplate = pageData.titleTemplate ?? siteConfig.userConfig.titleTemplate;
    if (
      pageData.isNotFound ||
      !pageData.filePath.endsWith(".md") ||
      typeof titleTemplate !== "string"
    ) {
      return;
    }

    const fullTitle = titleTemplate.replace(":title", pageData.title);
    const canonicalUrl = `https://vonsim.github.io/${pageData.relativePath}`
      .replace(/index\.md$/, "")
      .replace(/\.md$/, ".html");
    const ogPath = pageData.filePath.replace(/\.md$/, ".png");

    return [
      ["link", { rel: "canonical", href: canonicalUrl }],
      ["meta", { property: "og:type", content: "website" }],
      ["meta", { property: "og:url", content: canonicalUrl }],
      ["meta", { property: "og:title", content: fullTitle }],
      ["meta", { property: "og:image", content: `https://vonsim.github.io/${ogPath}` }],
    ];
  },

  async buildEnd(siteConfig) {
    const md = await createMarkdownRenderer(
      siteConfig.srcDir,
      siteConfig.markdown,
      siteConfig.site.base,
      siteConfig.logger,
    );
    await generateOpenGraphs(md, new URL(`file://${siteConfig.outDir}/`));
  },
});
