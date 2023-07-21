import type { Register } from "../../types";

/**
 * Returns the encoded register to be used in the instruction bytes.
 * @param reg The register to get the bits for.
 * @see https://vonsim.github.io/docs/reference/codification/
 */
export function registerToBits(reg: Register): number {
  switch (reg) {
    case "AL":
    case "AX":
      return 0b000;
    case "CL":
    case "CX":
      return 0b001;
    case "DL":
    case "DX":
      return 0b010;
    case "BL":
    case "BX":
      return 0b011;
    case "AH":
    case "SP":
      return 0b100;
    case "CH":
      return 0b101;
    case "DH":
      return 0b110;
    case "BH":
      return 0b111;
  }
}
