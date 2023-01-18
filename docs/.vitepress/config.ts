import { defineConfig } from "vitepress";

export default defineConfig({
  title: "VonSim",
  description: "Un simulador de assembly tipo 8088",
  lang: "es",
  base: "/docs/",
  lastUpdated: true,
  themeConfig: {
    docFooter: { prev: "Anterior", next: "Siguiente" },
    editLink: {
      pattern: "https://github.com/vonsim/vonsim/edit/main/docs/:path",
      text: "Editar esta página en GitHub",
    },
    footer: {
      message: "Publicado bajo la licencia MIT.",
      copyright:
        "Copyright &copy; 2017-presente Facultad de Informática, Universidad Nacional de La Plata.",
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
          { text: "Modos de direccionamiento", link: "/como-usar/modos-de-direccionamiento" },
          { text: "Interrupciones de software", link: "/como-usar/interrupciones-de-software" },
          {
            text: "Dispositivos",
            link: "/como-usar/dispositivos/listado",
            items: [
              { text: "Consola", link: "/como-usar/dispositivos/consola" },
              { text: "PIC", link: "/como-usar/dispositivos/pic" },
              { text: "PIO", link: "/como-usar/dispositivos/pio" },
              { text: "Tecla F10", link: "/como-usar/dispositivos/f10" },
              { text: "Timer", link: "/como-usar/dispositivos/timer" },
              { text: "Teclas y leds", link: "/como-usar/dispositivos/teclas-y-leds" },
            ],
          },
        ],
      },
      {
        text: "Especificaciones",
        items: [{ text: "Codificación", link: "/especificaciones/codificacion" }],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/vonsim/vonsim" }],
    outlineTitle: "Contenidos",
  },
});
