// @ts-check

import fs from "node:fs/promises";
import satori from "satori";
import { html } from "satori-html";
import sharp from "sharp";
import { createContentLoader } from "vitepress";

// Sharp doesn't handle embedded SVG's well, so we convert it to a PNG first
// https://stackoverflow.com/a/58413673
const logoSvg = await fs.readFile(new URL("../public/logo.svg", import.meta.url));
const logoPng = await sharp(logoSvg).resize(500, 500).png().toBuffer();
const logo = "data:image/png;base64," + logoPng.toString("base64");

/** @type {Record<string, import("satori").Font>} */
const chivo = {
  regular: {
    name: "Chivo",
    weight: 400,
    style: "normal",
    data: await fs.readFile(new URL("./theme/fonts/chivo/Chivo-Regular.ttf", import.meta.url)),
  },
  bold: {
    name: "Chivo",
    weight: 700,
    style: "normal",
    data: await fs.readFile(new URL("./theme/fonts/chivo/Chivo-Bold.ttf", import.meta.url)),
  },
};

/**
 * @param {URL} outDir
 * @returns {Promise<void>}
 */
export async function generateOpenGraphs(outDir) {
  const pages = await createContentLoader("**/*.md").load();
  for (const page of pages) {
    if (page.url.includes("404")) continue;

    const path = page.url
      .replace(/\/$/, "/index.html")
      .replace(/\.html$/, ".png")
      .replace(/^\//, "");
    const title = page.frontmatter.title;

    const markup = html`
      <div
        tw="w-[1200px] h-[630px] bg-stone-900 flex flex-col p-6"
        style="
        background-image: radial-gradient(circle at 25px 25px, #44403c 2%, transparent 0%), radial-gradient(circle at 75px 75px, #44403c 2%, transparent 0%);
        background-size: 100px 100px;
      "
      >
        <header tw="flex flex-row w-full items-center">
          <img src="${logo}" tw="w-24 h-24 mr-4" />
          <p tw="font-bold text-5xl mr-4">
            <span tw="text-white">Von</span>
            <span tw="text-[#82bd69]">Sim</span>
          </p>
          <p tw="text-4xl text-white">Documentación</p>
        </header>
        <main tw="flex flex-col justify-center grow pb-20">
          <h1 tw="text-8xl text-white font-bold">${title}</h1>
        </main>
      </div>
    `;

    const svg = await satori(markup, {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: [chivo.regular, chivo.bold],
    });

    const png = await sharp(Buffer.from(svg)).png().toBuffer();

    await fs.writeFile(new URL(path, outDir), png);
  }
}
