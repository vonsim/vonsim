import { match } from "ts-pattern";

import { MAX_VALUE, Size } from "@/config";
import { bit } from "@/helpers";
import type { SimulatorSlice } from "@/simulator";

export type ArithmeticOperation = "ADD" | "ADC" | "SUB" | "SBB";
export type LogicalOperation = "AND" | "OR" | "XOR" | "NOT";
export type ALUOperation = ArithmeticOperation | LogicalOperation;

type Flags = { carry: boolean; overflow: boolean; sign: boolean; zero: boolean };

export type ALUSlice = {
  alu: {
    left: number;
    right: number;
    result: number;
    operation: ALUOperation;
    flags: Flags;
  };

  executeArithmetic: (
    operation: ArithmeticOperation,
    left: number,
    right: number,
    size: Size,
  ) => number;
  executeLogical: (operation: LogicalOperation, left: number, right: number, size: Size) => number;

  encodeFlags: () => number;
  decodeFlags: (bits: number) => void;
};

export const createALUSlice: SimulatorSlice<ALUSlice> = (set, get) => ({
  alu: {
    left: 0,
    right: 0,
    result: 0,
    operation: "AND",
    flags: { carry: false, overflow: false, sign: false, zero: true },
  },

  executeArithmetic: (operation, left, right, size) => {
    let result: number = match(operation)
      .with("ADD", () => left + right)
      .with("ADC", () => left + right + Number(get().alu.flags.carry))
      .with("SUB", () => left - right)
      .with("SBB", () => left - right - Number(get().alu.flags.carry))
      .exhaustive();

    const flags: Flags = { carry: false, overflow: false, sign: false, zero: false };

    if (result > MAX_VALUE[size]) {
      // overflow
      flags.carry = true;
      result -= MAX_VALUE[size] + 1;
    } else if (result < 0) {
      // underflow
      flags.carry = true;
      result += MAX_VALUE[size] + 1;
    }

    const signBit = size === "byte" ? 7 : 15;
    const leftSign = bit(left, signBit);
    const rightSign = bit(right, signBit);
    const resultSign = bit(result, signBit);

    if (operation === "ADD" || operation === "ADC") {
      // When adding, the overflow flag is set if
      // - the sum of two positive numbers is negative, or
      // - the sum of two negative numbers is positive.
      flags.overflow = leftSign === rightSign && leftSign !== resultSign;
    } else {
      // When subtracting, the overflow flag is set if
      // - a positive number minus a negative number is negative, or
      // - a negative number minus a positive number is positive.
      flags.overflow = leftSign !== rightSign && rightSign === resultSign;
    }

    flags.sign = resultSign;
    flags.zero = result === 0;

    set({
      alu: { left, right, result, operation, flags },
    });

    return result;
  },

  executeLogical: (operation, left, right, size) => {
    const result: number = match(operation)
      .with("AND", () => left & right)
      .with("OR", () => left | right)
      .with("XOR", () => left ^ right)
      .with("NOT", () => ~right)
      .exhaustive();

    const flags: Flags = {
      carry: false,
      overflow: false,
      sign: bit(result, size === "byte" ? 7 : 15),
      zero: result === 0,
    };

    set({
      alu: { left, right, result, operation, flags },
    });

    return result;
  },

  encodeFlags: () => {
    const flags = get().alu.flags;
    let bits = 0b0000;
    if (flags.carry) bits |= 0b0001;
    if (flags.overflow) bits |= 0b0010;
    if (flags.sign) bits |= 0b0100;
    if (flags.zero) bits |= 0b1000;
    return bits;
  },

  decodeFlags: bits => {
    const flags = {
      carry: bit(bits, 0),
      overflow: bit(bits, 1),
      sign: bit(bits, 2),
      zero: bit(bits, 3),
    };
    set(state => {
      state.alu.flags = flags;
    });
  },
});
