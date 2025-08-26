// @ts-check

import { localSearch, sidebarInstructions } from "../shared.js";

/** @type {import("vitepress").LocaleSpecificConfig<import("vitepress").DefaultTheme.Config>} */
export const es = {
  lang: "es",
  description:
    "Un simulador de ensamblador 8088 con múltiples dispositivos y funcionalidades. Funciona en escritorio y móvil.",
  themeConfig: {
    darkModeSwitchLabel: "Aparencia",
    darkModeSwitchTitle: "Cambiar a modo oscuro",
    docFooter: { prev: "Anterior", next: "Siguiente" },
    editLink: {
      pattern: "https://github.com/vonsim/vonsim/edit/main/docs/:path",
      text: "Editar esta página",
    },
    footer: {
      message: `Esta obra está bajo la licencia <a target="_blank" rel="license noopener noreferrer" href="http://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>.`,
    },
    langMenuLabel: "Idioma",
    lastUpdated: { text: "Última actualización" },
    nav: [{ text: "Simulador", link: "/" }],
    notFound: {
      code: "404",
      title: "PÁGINA NO ENCONTRADA",
      quote: "Página no está en caché. Ni en memoria. Ni en ninguna parte, realmente.",
      linkLabel: "ir a la página principal",
      linkText: "JMP inicio",
    },
    outline: { label: "En esta página" },
    returnToTopLabel: "Volver arriba",
    search: localSearch({
      button: {
        buttonText: "Buscar",
        buttonAriaLabel: "Buscar",
      },
      modal: {
        backButtonTitle: "Cerrar búsqueda",
        displayDetails: "Mostrar lista detallada",
        footer: {
          closeKeyAriaLabel: "escape",
          closeText: "para cerrar",
          navigateDownKeyAriaLabel: "flecha abajo",
          navigateText: "para navegar",
          navigateUpKeyAriaLabel: "flecha arriba",
          selectKeyAriaLabel: "enter",
          selectText: "para seleccionar",
        },
        noResultsText: "No se encontraron resultados para",
        resetButtonTitle: "Limpiar búsqueda",
      },
    }),
    sidebar: {
      "/es/": {
        base: "/es/",
        items: [
          {
            text: "Computadora",
            base: "/es/computer/",
            items: [
              { text: "CPU", link: "cpu" },
              { text: "Memoria principal", link: "memory" },
              { text: "Lenguaje ensamblador", link: "assembly" },
              {
                text: "Instrucciones",
                link: "instructions/",
                collapsed: true,
                items: sidebarInstructions("es"),
              },
            ],
          },
          {
            text: "Entrada/Salida",
            base: "/es/io/",
            items: [
              { text: "Conceptos generales", link: "/" },
              {
                text: "Módulos E/S",
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
                text: "Dispositivos",
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
            text: "Referencia",
            items: [
              { text: "Tabla ASCII", link: "reference/ascii" },
              { text: "Codificación", link: "reference/encoding" },
              { text: "Metadata", link: "reference/metadata" },
              { text: "Notas de versión", link: "changelog" },
            ],
          },
        ],
      },
    },
    sidebarMenuLabel: "Menú",
  },
};
