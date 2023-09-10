import * as fs from "node:fs/promises";

import type { APIContext, GetStaticPathsResult } from "astro";
import { getCollection, getEntryBySlug } from "astro:content";
import satori, { type Font } from "satori";
import { html } from "satori-html";
import sharp from "sharp";

// Sharp doesn't handle embedded SVG's well, so we convert it to a PNG first
// https://stackoverflow.com/a/58413673
const logoSvg = await fs.readFile("./public/favicon.svg");
const logoPng = await sharp(logoSvg).resize(500, 500).png().toBuffer();
const logo = "data:image/png;base64," + logoPng.toString("base64");

const chivo = {
  regular: {
    name: "Chivo",
    weight: 400,
    style: "normal",
    data: await fs.readFile("./src/assets/chivo/Chivo-Regular.ttf"),
  },
  bold: {
    name: "Chivo",
    weight: 700,
    style: "normal",
    data: await fs.readFile("./src/assets/chivo/Chivo-Bold.ttf"),
  },
} satisfies Record<string, Font>;

// https://docs.astro.build/en/core-concepts/endpoints/#params-and-dynamic-routing
export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  const entries = await getCollection("docs");
  entries[0].id;
  return entries.map(entry => ({ params: { slug: entry.slug } }));
}

// https://docs.astro.build/en/core-concepts/endpoints/#params-and-dynamic-routing
export async function GET({ params }: APIContext): Promise<Response> {
  const entry = (await getEntryBySlug("docs", params.slug!))!;

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
        <h1 tw="text-8xl text-white font-bold">${entry.data.title}</h1>
      </main>
    </div>
  `;

  const svg = await satori(markup as any, {
    width: 1200,
    height: 630,
    embedFont: true,
    fonts: [chivo.regular, chivo.bold],
  });

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: { "Content-Type": "image/png" },
  });
}
