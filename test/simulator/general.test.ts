import { Ok } from "rust-optionals";
import { expect, it } from "vitest";

import { initProgram, simulator } from "./_simulator";

it("Data directives", () => {
  initProgram(`
    ORG 1000h
    vardb DB 1

    ORG 1500h
    vardb2 DB 2
    vardw DW 20
    vardw2 DW 24

    ORG 2000h
    HLT
    END
  `);

  expect(simulator().getMemory(0x1000, "byte")).toStrictEqual(Ok(1));
  expect(simulator().getMemory(0x1500, "byte")).toStrictEqual(Ok(2));
  expect(simulator().getMemory(0x1501, "word")).toStrictEqual(Ok(20));
  expect(simulator().getMemory(0x1503, "word")).toStrictEqual(Ok(24));
  expect(simulator().executeInstruction()).toStrictEqual(Ok("halt"));
});

it("Stack", () => {
  initProgram(`
    ORG 2000h
    MOV AX, 3
    PUSH AX
    POP BX
    HLT
    END
  `);

  // MOV AX, 3
  expect(simulator().executeInstruction()).toStrictEqual(Ok("continue"));
  expect(simulator().getRegister("AX")).toStrictEqual(3);
  // PUSH AX
  expect(simulator().executeInstruction()).toStrictEqual(Ok("continue"));
  expect(simulator().getRegister("SP")).toStrictEqual(0x3ffe);
  expect(simulator().getMemory(0x3ffe, "word")).toStrictEqual(Ok(3));
  // POP BX
  expect(simulator().executeInstruction()).toStrictEqual(Ok("continue"));
  expect(simulator().getRegister("SP")).toStrictEqual(0x4000);
  expect(simulator().getRegister("BX")).toStrictEqual(3);
  // HLT
  expect(simulator().executeInstruction()).toStrictEqual(Ok("halt"));
});
