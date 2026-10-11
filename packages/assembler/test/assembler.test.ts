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

  it("should allow the count to depend on addresses of labels defined before", () => {
    const result = assemble(`
      org 2000h
      first: mov ax, 1
      last: hlt
      org 1000h
      table db 1, 2, 3
      tableEnd db 0
      copy db (offset tableEnd - offset table) dup(0)
      length equ offset tableEnd - offset table
      words dw length dup(?)
      code db (last - first) dup(0)
      end
    `);

    if (!result.success) throw new Error("Expected program to assemble");
    const [, , copy, words, code] = result.program.data;

    expect(copy.length).toBe(3);
    expect(words.start.value).toBe(0x1007);
    expect(words.length).toBe(6);
    expect(code.start.value).toBe(0x100d);
    expect(code.length).toBe(4);
  });

  it("should not allow the count to depend on addresses of labels defined after", () => {
    const result = assemble(`
      org 1000h
      a db (offset c - offset b) dup(0)
      b db 1
      c db 2
      size equ offset later
      d db size dup(0)
      e db lbl dup(0)
      later db 0
      org 2000h
      lbl: hlt
      end
    `);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.map(e => e.code)).toEqual([
      "dup-count-depends-on-later-label",
      "dup-count-depends-on-later-label",
      "dup-count-depends-on-later-label",
    ]);
  });

  it("should allow the count to depend on its own label", () => {
    const result = assemble(`
      org 1000h
      a db 1
      b db (offset b - offset a + 2) dup(0)
      c db 2
      end
    `);

    if (!result.success) throw new Error("Expected program to assemble");
    const [, b, c] = result.program.data;

    expect(b.length).toBe(3);
    expect(c.start.value).toBe(0x1004);
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

  it("should reject counts that are zero or negative", () => {
    const result = assemble(`
      org 1000h
      db -1 dup(0)
      db 0 dup(0)
      db 2 dup(1, 0 dup(0))
      end
    `);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.map(e => e.code)).toEqual([
      "dup-count-positive",
      "dup-count-positive",
      "dup-count-positive",
    ]);
  });
});

describe("Local labels", () => {
  it("should belong to the previous label without a dot", () => {
    const result = assemble(`
      org 2000h
      call subrutine
      hlt

      org 3000h
      subrutine:
        nop
        nop
      .loop:
        nop
        nop
        jmp .loop
        ret
      end
    `);

    if (!result.success) throw new Error("Expected program to assemble");
    const { instructions } = result.program;
    const loop = instructions.find(i => i.label === "SUBRUTINE.LOOP");
    const jmp = instructions.find(i => i.instruction === "JMP");

    expect(loop?.start.value).toBe(0x3002);
    expect(jmp?.toJSON()).toMatchObject({ address: 0x3002 });
  });

  it("should be reusable after each label without a dot", () => {
    const result = assemble(`
      org 3000h
      first: mov cx, 3
      .loop: dec cx
        jnz .loop
        ret

      second: mov cx, 5
      .loop: dec cx
        jnz .loop
        ret
      end
    `);

    if (!result.success) throw new Error("Expected program to assemble");
    const { instructions } = result.program;
    const firstLoop = instructions.find(i => i.label === "FIRST.LOOP")!;
    const secondLoop = instructions.find(i => i.label === "SECOND.LOOP")!;
    const [firstJnz, secondJnz] = instructions.filter(i => i.instruction === "JNZ");

    expect(firstLoop.start.value).not.toBe(secondLoop.start.value);
    expect(firstJnz.toJSON()).toMatchObject({ address: firstLoop.start.value });
    expect(secondJnz.toJSON()).toMatchObject({ address: secondLoop.start.value });
  });

  it("should be unique between two labels without a dot", () => {
    const result = assemble(`
      org 3000h
      first: nop
      .loop: nop
      .loop: nop
      second: nop
      .loop: jmp .loop
      end
    `);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.map(e => e.translate("en"))).toEqual(['Duplicated label "FIRST.LOOP".']);
  });

  it("should not be visible after the next label without a dot", () => {
    const result = assemble(`
      org 3000h
      first: nop
      .loop: jmp .loop
      second: jmp .loop
      end
    `);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(result.errors.map(e => e.translate("en"))).toEqual([
      'Label "SECOND.LOOP" has not been defined.',
    ]);
  });

  it("should not care about labels of data directives and constants", () => {
    const result = assemble(`
      org 2000h
      main: jmp .skip
      msg db "hi"
      five equ 5
      .skip: hlt
      end
    `);

    if (!result.success) throw new Error("Expected program to assemble");
    const { instructions } = result.program;
    const skip = instructions.find(i => i.label === "MAIN.SKIP");
    const jmp = instructions.find(i => i.instruction === "JMP");

    expect(skip?.start.value).toBe(0x2005); // After the JMP (3 bytes) and "hi" (2 bytes)
    expect(jmp?.toJSON()).toMatchObject({ address: 0x2005 });

    // Local labels can't belong to them either
    const withoutParent = assemble(`
      org 1000h
      msg db "hi"
      org 2000h
      .loop: jmp .loop
      end
    `);

    expect(withoutParent.success).toBe(false);
    if (withoutParent.success) return;
    expect(withoutParent.errors.map(e => e.code)).toEqual(["local-label-without-parent"]);
  });
});
