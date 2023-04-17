import { defineConfig } from "vitepress";
import vonsimGrammar from "./theme/vonsim.tmLanguage.json";

export default defineConfig({
  title: "VonSim",
  description: "Un simulador de assembly tipo 8088",
  lang: "es",
  base: "/docs/",
  lastUpdated: true,
  cleanUrls: true,
  markdown: {
    languages: [
      // From https://github.com/JuanM04/unlp-vscode/blob/main/syntaxes/vonsim.tmLanguage.yaml
      // Copied 2023-04-15
      {
        id: "vonsim",
        path: "vonsim.tmLanguage.json",
        scopeName: "source.asm.vonsim",
        aliases: ["vonsim", "asm"],
        grammar: vonsimGrammar as any,
      },
    ],
  },
  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "Documentación",
    nav: [{ text: "Volver a VonSim", link: "pathname:///" }],
    docFooter: { prev: "Anterior", next: "Siguiente" },
    editLink: {
      pattern: "https://github.com/vonsim/vonsim/edit/main/docs/:path",
      text: "Editar esta página en GitHub",
    },
    lastUpdatedText: "Última actualización",
    sidebar: [
      {
        text: "Introducción",
        items: [
          { text: "¿Qué es VonSim?", link: "/" },
          { text: "Diferencias con el Intel 8088", link: "/diferencias-con-la-realidad" },
        ],
      },
      {
        text: "Cómo usar",
        items: [
          {
            text: "Instrucciones",
            link: "/como-usar/instrucciones/listado",
            items: [
              {
                text: "de transferencia de datos",
                link: "/como-usar/instrucciones/transferencia-de-datos",
              },
              { text: "aritméticas", link: "/como-usar/instrucciones/aritmeticas" },
              { text: "lógicas", link: "/como-usar/instrucciones/logicas" },
              {
                text: "de transferencia de control",
                link: "/como-usar/instrucciones/transferencia-de-control",
              },
              {
                text: "de manejo de interrupciones",
                link: "/como-usar/instrucciones/manejo-de-interrupciones",
              },
              { text: "de control", link: "/como-usar/instrucciones/control" },
            ],
          },
          { text: "Pila", link: "/como-usar/pila" },
          { text: "Subrutinas", link: "/como-usar/subrutinas" },
          { text: "Modos de direccionamiento", link: "/como-usar/modos-de-direccionamiento" },
          { text: "Interrupciones por software", link: "/como-usar/interrupciones-por-software" },
          { text: "Interrupciones por hardware", link: "/como-usar/interrupciones-por-hardware" },
          {
            text: "Dispositivos",
            link: "/como-usar/dispositivos/listado",
            items: [
              { text: "Handshake", link: "/como-usar/dispositivos/handshake" },
              { text: "PIC", link: "/como-usar/dispositivos/pic" },
              { text: "PIO", link: "/como-usar/dispositivos/pio" },
              { text: "Timer", link: "/como-usar/dispositivos/timer" },
              { text: "Consola", link: "/como-usar/dispositivos/consola" },
              { text: "Impresora", link: "/como-usar/dispositivos/impresora" },
              { text: "Tecla F10", link: "/como-usar/dispositivos/f10" },
              { text: "Teclas y leds", link: "/como-usar/dispositivos/teclas-y-leds" },
            ],
          },
        ],
      },
      {
        text: "Especificaciones",
        items: [
          { text: "Codificación", link: "/especificaciones/codificacion" },
          { text: "Tabla ASCII", link: "/especificaciones/tabla-ascii" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/vonsim/vonsim" }],
    outlineTitle: "Contenidos",
    search: {
      provider: "local",
      options: {
        translations: {
          button: {
            buttonText: "Buscar",
          },
          modal: {
            backButtonTitle: "Volver",
            displayDetails: "Mostrar detalles",
            noResultsText: "No se han encontrado resultados para",
            resetButtonTitle: "Borrar búsqueda",
            footer: {
              navigateText: "para navegar",
              selectText: "para seleccionar",
            },
          },
        },
      },
    },
  },
});
