import { tdeep } from "tdeep";
import { match } from "ts-pattern";
import { MAX_SIGNED_VALUE, MAX_VALUE, MIN_SIGNED_VALUE, Size } from "~/config";
import { unsignedToSigned } from "~/helpers";
import type { SimulatorSlice } from "~/simulator";

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

    const flags = {
      carry: uresult < 0 || uresult > MAX_VALUE[size],
      overflow: result < MIN_SIGNED_VALUE[size] || result > MAX_SIGNED_VALUE[size],
      sign: result < 0,
      zero: result === 0,
    };

    if (uresult > MAX_VALUE[size]) uresult = uresult - MAX_VALUE[size] - 1; // overflow
    else if (uresult < 0) uresult = uresult + MAX_VALUE[size] + 1; // underflow

    set({
      alu: {
        left,
        right,
        result: uresult,
        operation,
        flags,
      },
    });

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

    set({
      alu: {
        left,
        right,
        result,
        operation,
        flags,
      },
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
      carry: (bits & 0b0001) !== 0,
      overflow: (bits & 0b0010) !== 0,
      sign: (bits & 0b0100) !== 0,
      zero: (bits & 0b1000) !== 0,
    };
    set(tdeep("alu.flags", flags));
  },
});
