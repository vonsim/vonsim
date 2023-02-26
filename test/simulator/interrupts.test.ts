import { Ok } from "rust-optionals";
import { describe, expect, it } from "vitest";

import { initProgram } from "./_simulator";

it("INT 0", () => {
  const simulator = initProgram(`
    ORG 2000h
    INT 0
    END
  `);

  expect(simulator.run(1)).toStrictEqual(Ok("halt"));
});

it("INT 3", () => {
  const simulator = initProgram(`
    ORG 2000h
    INT 3
    END
  `);

  expect(simulator.run(1)).toStrictEqual(Ok("start-debugger"));
});

describe("INT 6", () => {
  it("should write to memory and console", () => {
    const simulator = initProgram(`
      ORG 1000h
      num DB ?
  
      ORG 2000h
      MOV bx, OFFSET num
      INT 6
      INT 0
      END
    `);

    expect(simulator.run(2)).toStrictEqual(Ok("wait-for-input"));
    expect(simulator.cpu.handleInt6("A")).toStrictEqual(Ok());

    expect(simulator.memory.get(0x1000, "byte")).toStrictEqual(Ok(65));
    expect(simulator.devices.console.toJSON()).toBe("A");
  });

  it("should throw on invalid memory address", () => {
    const simulator = initProgram(`
      ORG 1000h
      num DB ?
  
      ORG 2000h
      MOV bx, 8000h
      INT 6
      INT 0
      END
    `);

    expect(simulator.run(2)).toStrictEqual(Ok("wait-for-input"));
    expect(simulator.cpu.handleInt6("A")).toMatchInlineSnapshot(`
      Result {
        "val": [Error: Memory address 8000h is out of range (max memory address: 3FFFh).],
      }
    `);

    expect(simulator.devices.console.toJSON()).toBe("");
  });
});

describe("INT 7", () => {
  it("should write to console", () => {
    const simulator = initProgram(`
      ORG 1000H
      MSJ DB "ARQUITECTURA DE COMPUTADORAS-"
  	  DB "FACULTAD DE INFORMATICA-"
  	  DB 55H
  	  DB 4EH
  	  DB 4CH
  	  DB 50H
      FIN DB ?
  
      ORG 2000H
  	  MOV BX, OFFSET MSJ
  	  MOV AL, OFFSET FIN-OFFSET MSJ
  	  INT 7
  	  INT 0
      END
    `);

    expect(simulator.run(3)).toStrictEqual(Ok("continue"));
    expect(simulator.devices.console.toJSON()).toBe(
      "ARQUITECTURA DE COMPUTADORAS-FACULTAD DE INFORMATICA-UNLP",
    );
  });

  it("should throw on invalid memory address", () => {
    const simulator = initProgram(`
      ORG 3FF9H
      MSJ DB "ABCDEF"
  
      ORG 2000H
  	  MOV BX, OFFSET MSJ
  	  MOV AL, 10 ; more than the length of the string
  	  INT 7
  	  INT 0
      END
    `);

    expect(simulator.run(3)).toMatchInlineSnapshot(`
      Result {
        "val": [Error: Memory address 4000h is out of range (max memory address: 3FFFh).],
      }
    `);
    expect(simulator.devices.console.toJSON()).toBe("");
  });
});
