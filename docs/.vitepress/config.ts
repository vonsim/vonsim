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
        ],
      },
      {
        text: "Especificaciones",
        items: [
          { text: "Codificación", link: "/especificaciones/codificacion" },
          { text: "Consola", link: "/especificaciones/consola" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/vonsim/vonsim" }],
    outlineTitle: "Contenidos",
  },
});
