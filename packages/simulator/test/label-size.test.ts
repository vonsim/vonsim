import { expect, it } from "vitest";

import { run } from "./run";

it("should use the size of the register with a label of a different size", () => {
  const result = run(`
    org 1000h
    b db 11h
    c db 22h
    w dw 3344h
    org 2000h
    mov ax, 0AABBh
    mov b, ax
    mov cx, w
    mov dx, b
    mov bl, w
    hlt
    end
  `);

  expect([...result.memory.slice(0x1000, 0x1002)]).toEqual([0xbb, 0xaa]);
  expect(result.cpu.CX).toBe(0x3344);
  expect(result.cpu.DX).toBe(0xaabb);
  expect(result.cpu.BX & 0xff).toBe(0x44);
});
