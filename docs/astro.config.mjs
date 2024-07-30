import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

import vonsimLang from "./src/assets/vonsim.tmLanguage.json";

// https://astro.build/config
export default defineConfig({
  site: "https://vonsim.github.io",
  base: "/docs/",
  trailingSlash: "always",

  integrations: [
    starlight({
      title: "VonSim",
      favicon: "/favicon.svg",
      logo: { src: "./public/favicon.svg", alt: "Logo" },
      editLink: {
        baseUrl: "https://github.com/vonsim/vonsim/edit/main/docs/",
      },
      pagination: false,
      lastUpdated: true,
      social: {
        github: "https://github.com/vonsim/vonsim",
      },

      defaultLocale: "root",
      locales: {
        root: { lang: "es", label: "Español" },
        // en: { label: "English" },
      },

      sidebar: [
        { label: "Inicio", link: "/" },
        {
          label: "CPU",
          items: [
            { label: "Conceptos generales", link: "/cpu/" },
            { label: "Lenguaje ensamblador", link: "/cpu/assembly/" },
            {
              label: "Instrucciones",
              collapsed: true,
              autogenerate: { directory: "cpu/instructions" },
            },
          ],
        },
        { label: "Memoria principal", link: "/memory/" },
        {
          label: "Entrada/Salida",
          items: [
            { label: "Conceptos generales", link: "/io/" },
            {
              label: "Módulos E/S",
              collapsed: true,
              autogenerate: { directory: "io/modules" },
            },
            {
              label: "Dispositivos",
              collapsed: true,
              autogenerate: { directory: "io/devices" },
            },
          ],
        },
        {
          label: "Referencia",
          autogenerate: { directory: "reference" },
        },
        { label: "Notas de versión", link: "/changelog/" },
      ],

      customCss: ["./src/styles/custom.css"],
      head: [
        {
          tag: "script",
          attrs: {
            async: true,
            defer: true,
            src: "https://umami.jms.ar/script.js",
            "data-website-id": "7ed03e0b-660d-4c86-ba49-1e58f5981823",
            "data-do-not-track": "true",
          },
        },
      ],
    }),
  ],

  // Process images with sharp: https://docs.astro.build/en/guides/assets/#using-sharp
  image: { service: { entrypoint: "astro/assets/services/sharp" } },

  // Markdown configuration: https://docs.astro.build/en/reference/configuration-reference/#markdown-options
  markdown: {
    shikiConfig: {
      langs: [vonsimLang],
      theme: "vitesse-dark", // best approximation of the theme
    },
  },
});
