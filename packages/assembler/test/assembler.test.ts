import { readdir, readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { assemble } from "../src";

describe("Fixtures", async () => {
  const path = new URL("./fixtures/", import.meta.url);
  const files = await readdir(path);

  for (const file of files) {
    it(`should match snapshot of ${file}`, async () => {
      const source = await readFile(new URL(file, path), { encoding: "utf-8" });
      expect(assemble(source)).toMatchSnapshot();
    });
  }
});

describe("DUP", () => {
  it("should take the repetitions into account when computing addresses", () => {
    const result = assemble(`
      org 1000h
      len equ 2
      a db 3 dup(1, len dup(?))
      b dw len dup(5), 1
      c db 1
      end
    `);

    if (!result.success) throw new Error("Expected program to assemble");
    const [a, b, c] = result.program.data;

    expect(a.length).toBe(9);
    expect(a.getValues()).toHaveLength(9);
    expect(b.start.value).toBe(0x1009);
    expect(b.length).toBe(6);
    expect(b.getValues()).toHaveLength(3);
    expect(c.start.value).toBe(0x100f);
  });

  it("should allow forward references to constants in the count", () => {
    const result = assemble(`
      org 1000h
      a db n dup(1)
      b db 1
      n equ m * 2
      m equ 3
      end
    `);

    if (!result.success) throw new Error("Expected program to assemble");
    const [a, b] = result.program.data;

    expect(a.length).toBe(6);
    expect(b.start.value).toBe(0x1006);
  });

  it("should detect overlaps caused by a DUP", () => {
    const result = assemble(`
      org 1000h
      db 4 dup(0)
      org 1003h
      db 1
      end
    `);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.map(e => e.code)).toEqual(["occupied-address"]);
  });

  it("should not allow the count to depend on an address", () => {
    const result = assemble(`
      org 1000h
      a db 1
      size equ offset a
      db size dup(0)
      org 2000h
      lbl: hlt
      db lbl dup(0)
      end
    `);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.map(e => e.code)).toEqual([
      "dup-count-depends-on-address",
      "dup-count-depends-on-address",
    ]);
  });

  it("should not allocate huge DUPs", () => {
    const result = assemble(`
      org 1000h
      db 1000000000 dup(1000000000 dup(0))
      end
    `);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.map(e => e.code)).toEqual(["instruction-out-of-range"]);
  });

  it("should reject negative counts", () => {
    const result = assemble(`
      org 1000h
      db -1 dup(0)
      end
    `);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.map(e => e.code)).toEqual(["dup-count-positive"]);
  });
});
