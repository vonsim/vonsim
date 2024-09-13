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
        items: [
          {
            text: "Computer",
            base: "/en/computer/",
            items: [
              { text: "CPU", link: "cpu" },
              { text: "Main Memory", link: "memory" },
              { text: "Assembly Language", link: "assembly" },
              {
                text: "Instructions",
                link: "instructions/",
                collapsed: true,
                items: sidebarInstructions("en"),
              },
            ],
          },
          {
            text: "Input/Output",
            base: "/en/io/",
            items: [
              { text: "General Concepts", link: "/" },
              {
                text: "I/O Modules",
                link: "modules/",
                collapsed: false,
                items: [
                  { text: "Handshake", link: "modules/handshake" },
                  { text: "PIC", link: "modules/pic" },
                  { text: "PIO", link: "modules/pio" },
                  { text: "Timer", link: "modules/timer" },
                ],
              },
              {
                text: "Devices",
                link: "devices/",
                collapsed: false,
                items: [
                  { text: "Reloj", link: "devices/clock" },
                  { text: "Tecla F10", link: "devices/f10" },
                  { text: "Teclado", link: "devices/keyboard" },
                  { text: "Impresora", link: "devices/printer" },
                  { text: "Pantalla", link: "devices/screen" },
                  { text: "Llaves y luces", link: "devices/switches-and-leds" },
                ],
              },
            ],
          },
          {
            text: "Reference",
            items: [
              { text: "ASCII Table", link: "reference/ascii" },
              { text: "Codification", link: "reference/codification" },
              { text: "Release Notes", link: "changelog" },
            ],
          },
        ],
      },
    },
  },
};
