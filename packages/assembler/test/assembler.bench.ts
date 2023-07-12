import { readdir, readFile } from "node:fs/promises";

import { bench, describe } from "vitest";

import { assemble } from "../src";

describe("Assembler benchmarks", async () => {
  const path = new URL("./fixtures/", import.meta.url);
  const files = await readdir(path);

  for (const file of files) {
    const source = await readFile(new URL(file, path), { encoding: "utf-8" });

    bench(file, () => void assemble(source));
  }
});
