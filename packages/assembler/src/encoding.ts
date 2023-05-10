import type { Register } from "@/types";

/**
 * Returns the bits of a register (3 bits)
 * @param reg Register
 * @see /docs/especificaciones/codificacion.md
 */
export function registerToBits(reg: Register) {
  const bits: { [key in Register]: number } = {
    AX: 0b000,
    CX: 0b001,
    DX: 0b010,
    BX: 0b011,
    SP: 0b100,
    AL: 0b000,
    CL: 0b001,
    DL: 0b010,
    BL: 0b011,
    AH: 0b100,
    CH: 0b101,
    DH: 0b110,
    BH: 0b111,
  };
  return bits[reg];
}
