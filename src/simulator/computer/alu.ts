import { match } from "ts-pattern";
import {
  MAX_BYTE_VALUE,
  MAX_SIGNED_BYTE_VALUE,
  MAX_SIGNED_WORD_VALUE,
  MAX_WORD_VALUE,
  MIN_SIGNED_BYTE_VALUE,
  MIN_SIGNED_WORD_VALUE,
} from "~/config";
import type { ComputerSlice } from ".";
import { unsignedToSigned } from "../helpers";

export type ArithmeticOperation = "ADD" | "ADC" | "SUB" | "SBB";
export type LogicalOperation = "AND" | "OR" | "XOR" | "NOT";
export type ALUOperation = ArithmeticOperation | LogicalOperation;

export type ALUSlice = {
  alu: {
    left: number;
    right: number;
    result: number;
    operation: ALUOperation;
    flags: { carry: boolean; overflow: boolean; sign: boolean; zero: boolean };
  };

  executeArithmetic: (
    operation: ArithmeticOperation,
    left: number,
    right: number,
    size: "byte" | "word",
  ) => number;
  executeLogical: (
    operation: LogicalOperation,
    left: number,
    right: number,
    size: "byte" | "word",
  ) => number;

  encodeFlags: () => number;
  decodeFlags: (bits: number) => void;
};

export const createALUSlice: ComputerSlice<ALUSlice> = (set, get) => ({
  alu: {
    left: 0,
    right: 0,
    result: 0,
    operation: "AND",
    flags: { carry: false, overflow: false, sign: false, zero: true },
  },

  executeArithmetic: (operation, uleft, uright, size) => {
    const left = unsignedToSigned(uleft, size);
    const right = unsignedToSigned(uright, size);

    // Unsigned result
    let uresult: number = match(operation)
      .with("ADD", () => uleft + uright)
      .with("ADC", () => uleft + uright + Number(get().alu.flags.carry))
      .with("SUB", () => uleft - uright)
      .with("SBB", () => uleft - uright - Number(get().alu.flags.carry))
      .exhaustive();

    // Signed result
    const result: number = match(operation)
      .with("ADD", () => left + right)
      .with("ADC", () => left + right + Number(get().alu.flags.carry))
      .with("SUB", () => left - right)
      .with("SBB", () => left - right - Number(get().alu.flags.carry))
      .exhaustive();

    const max = size === "byte" ? MAX_BYTE_VALUE : MAX_WORD_VALUE;
    const maxSigned = size === "byte" ? MAX_SIGNED_BYTE_VALUE : MAX_SIGNED_WORD_VALUE;
    const minSigned = size === "byte" ? MIN_SIGNED_BYTE_VALUE : MIN_SIGNED_WORD_VALUE;

    const flags = {
      carry: uresult < 0 || uresult > max,
      overflow: result < minSigned || result > maxSigned,
      sign: result < 0,
      zero: result === 0,
    };

    if (uresult > max) uresult = uresult - max - 1; // overflow
    else if (uresult < 0) uresult = uresult + max + 1; // underflow

    set(state => ({
      ...state,
      alu: {
        ...state.alu,
        left,
        right,
        result: uresult,
        operation,
        flags,
      },
    }));

    return uresult;
  },

  executeLogical: (operation, left, right, size) => {
    const result: number = match(operation)
      .with("AND", () => left & right)
      .with("OR", () => left | right)
      .with("XOR", () => left ^ right)
      .with("NOT", () => ~right)
      .exhaustive();

    const flags = {
      carry: false,
      overflow: false,
      sign: result >> (size === "byte" ? 7 : 15) === 1,
      zero: result === 0,
    };

    set(state => ({
      ...state,
      alu: {
        ...state.alu,
        left,
        right,
        result,
        operation,
        flags,
      },
    }));

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
      carry: (bits & 0b0001) !== 0,
      overflow: (bits & 0b0010) !== 0,
      sign: (bits & 0b0100) !== 0,
      zero: (bits & 0b1000) !== 0,
    };
    set(state => ({
      ...state,
      alu: { ...state.alu, flags },
    }));
  },
});
