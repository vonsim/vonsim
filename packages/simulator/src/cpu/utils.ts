import type { Split } from "type-fest";

import type { ByteRegister, PhysicalRegister, Register } from "./types";

/**
 * Given a register name, returns the physical register and the part of the register
 * specified (low, high or none).
 * @param register
 * @returns a tuple with the register name and the part of the register (low, high or none).
 */
export function parseRegister(
  register: Register,
): [reg: PhysicalRegister, part: "low" | "high" | null] {
  switch (register) {
    case "AL":
      return ["AX", "low"];
    case "AH":
      return ["AX", "high"];
    case "BL":
      return ["BX", "low"];
    case "BH":
      return ["BX", "high"];
    case "CL":
      return ["CX", "low"];
    case "CH":
      return ["CX", "high"];
    case "DL":
      return ["DX", "low"];
    case "DH":
      return ["DX", "high"];
    default: {
      const [reg, part] = register.split(".") as Split<typeof register, ".">;
      return [reg, part === "l" ? "low" : part === "h" ? "high" : null];
    }
  }
}

/**
 * Given a register name,
 * - if it's a word register, returns a tuple with the low and high byte registers.
 * - if it's a byte register, returns a tuple with the register and `null`.
 */
export function splitRegister(register: Register): [low: ByteRegister, high: ByteRegister | null] {
  switch (register) {
    case "AX":
      return ["AL", "AH"];
    case "BX":
      return ["BL", "BH"];
    case "CX":
      return ["CL", "CH"];
    case "DX":
      return ["DL", "DH"];
    case "SP":
      return ["SP.l", "SP.h"];
    case "BP":
      return ["BP.l", "BP.h"];
    case "IP":
      return ["IP.l", "IP.h"];
    case "ri":
      return ["ri.l", "ri.h"];
    case "id":
      return ["id.l", "id.h"];
    case "left":
      return ["left.l", "left.h"];
    case "right":
      return ["right.l", "right.h"];
    case "result":
      return ["result.l", "result.h"];
    case "FLAGS":
      return ["FLAGS.l", "FLAGS.h"];

    default:
      // It's a byte register
      return [register, null];
  }
}
