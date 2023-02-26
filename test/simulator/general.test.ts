import { Ok } from "rust-optionals";
import { expect, it } from "vitest";

import { initProgram } from "./_simulator";

it("Data directives", () => {
  const simulator = initProgram(`
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

  expect(simulator.memory.get(0x1000, "byte")).toStrictEqual(Ok(1));
  expect(simulator.memory.get(0x1500, "byte")).toStrictEqual(Ok(2));
  expect(simulator.memory.get(0x1501, "word")).toStrictEqual(Ok(20));
  expect(simulator.memory.get(0x1503, "word")).toStrictEqual(Ok(24));
  expect(simulator.run(1)).toStrictEqual(Ok("halt"));
});

it("Stack", () => {
  const simulator = initProgram(`
    ORG 2000h
    MOV AX, 3
    PUSH AX
    POP BX
    HLT
    END
  `);

  // MOV AX, 3
  expect(simulator.run(1)).toStrictEqual(Ok("continue"));
  expect(simulator.cpu.getRegister("AX")).toStrictEqual(3);
  // PUSH AX
  expect(simulator.run(1)).toStrictEqual(Ok("continue"));
  expect(simulator.cpu.getRegister("SP")).toStrictEqual(0x3ffe);
  expect(simulator.memory.get(0x3ffe, "word")).toStrictEqual(Ok(3));
  // POP BX
  expect(simulator.run(1)).toStrictEqual(Ok("continue"));
  expect(simulator.cpu.getRegister("SP")).toStrictEqual(0x4000);
  expect(simulator.cpu.getRegister("BX")).toStrictEqual(3);
  // HLT
  expect(simulator.run(1)).toStrictEqual(Ok("halt"));
});
