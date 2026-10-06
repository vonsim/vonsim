import { describe, expect, it } from "vitest";

import { run } from "./run";

describe("NEG", () => {
  it.each([
    [0x00, 0x00, { CF: false, ZF: true, SF: false, OF: false }],
    [0x01, 0xff, { CF: true, ZF: false, SF: true, OF: false }],
    [0x7f, 0x81, { CF: true, ZF: false, SF: true, OF: false }],
    [0xff, 0x01, { CF: true, ZF: false, SF: false, OF: false }],
    [0x80, 0x80, { CF: true, ZF: false, SF: true, OF: true }],
  ])("should negate %i", (value, expected, flags) => {
    const result = run(`
      org 2000h
      mov al, ${value}
      neg al
      hlt
      end
    `);

    expect(result.cpu.AX & 0xff).toBe(expected);
    expect(result.flags).toEqual(flags);
  });

  it("should negate the minimum negative value of 16 bits", () => {
    const result = run(`
      org 2000h
      mov ax, 8000h
      neg ax
      hlt
      end
    `);

    expect(result.cpu.AX).toBe(0x8000);
    expect(result.flags).toEqual({ CF: true, ZF: false, SF: true, OF: true });
  });

  it("should negate the minimum negative values in memory", () => {
    const result = run(`
      org 1000h
      b db 80h
      w dw 8000h
      org 2000h
      neg b
      neg w
      hlt
      end
    `);

    expect([...result.memory.slice(0x1000, 0x1003)]).toEqual([0x80, 0x00, 0x80]);
  });
});
