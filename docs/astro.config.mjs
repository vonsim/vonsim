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
        {
          tag: "script",
          content: `
            !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
            posthog.init('phc_gCxHEpXWtELrIJxf4O1rBStWonKXJJxHA9iQBN3UEu0', {api_host: 'https://eu.posthog.com', persistence: "memory", autocapture: false})
          `,
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
