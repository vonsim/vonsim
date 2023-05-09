import { readdir, readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { compile } from "@/compiler";

describe("Fixtures", async () => {
  const path = new URL("../fixtures/", import.meta.url);
  const files = await readdir(path);

  for (const file of files) {
    it(`should match snapshot of ${file}`, async () => {
      const source = await readFile(new URL(file, path), { encoding: "utf-8" });
      expect(compile(source)).toMatchSnapshot();
    });
  }
});
