import { klona } from "klona";
import { isMatching, match } from "ts-pattern";
import type { Split } from "type-fest";
import create from "zustand";
import type { Program } from "~/compiler";
import { PhysicalRegisterType, RegisterType } from "~/compiler/common";
import { partialRegisterPattern } from "~/compiler/common/patterns";
import {
  INITIAL_IP,
  MAX_BYTE_VALUE,
  MAX_MEMORY_ADDRESS,
  MAX_SIGNED_BYTE_VALUE,
  MAX_SIGNED_WORD_VALUE,
  MAX_WORD_VALUE,
  MEMORY_SIZE,
  MIN_MEMORY_ADDRESS,
  MIN_SIGNED_BYTE_VALUE,
  MIN_SIGNED_WORD_VALUE,
} from "~/config";
import { useConfig } from "../config";
import { joinLowHigh, renderAddress, splitLowHigh, unsignedToSigned } from "../helpers";
import { programToBytecode } from "./bytecode";
import { runInstruction } from "./runner";

export type ArithmeticOperation = "ADD" | "ADC" | "SUB" | "SBB";
export type LogicalOperation = "AND" | "OR" | "XOR" | "NOT";
export type ALUOperation = ArithmeticOperation | LogicalOperation;

export type ComputerStore = {
  memory: ArrayBuffer;
  registers: { [key in PhysicalRegisterType]: number };
  alu: {
    left: number;
    right: number;
    result: number;
    operation: ALUOperation;
    flags: { carry: boolean; overflow: boolean; sign: boolean; zero: boolean };
  };
  program: Program | null;

  getMemory(address: number, size: "byte" | "word"): number;
  getRegister(register: RegisterType): number;
  setMemory: (address: number, size: "byte" | "word", value: number) => void;
  setRegister: (register: RegisterType, value: number) => void;

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

  loadProgram: (program: Program) => void;
  runInstruction: () => boolean;
};

export const useComputer = create<ComputerStore>()((set, get) => ({
  memory: new ArrayBuffer(MEMORY_SIZE),
  registers: {
    AX: 0,
    BX: 0,
    CX: 0,
    DX: 0,
    IP: INITIAL_IP,
    IR: 0,
    SP: MEMORY_SIZE,
    MAR: 0,
    MBR: 0,
  },
  alu: {
    left: 0,
    right: 0,
    result: 0,
    operation: "AND",
    flags: { carry: false, overflow: false, sign: false, zero: true },
  },
  program: null,

  getMemory: (address, size) => {
    if (size === "byte") {
      if (address < MIN_MEMORY_ADDRESS || address > MAX_MEMORY_ADDRESS) {
        throw new Error(`La dirección de memoria ${renderAddress(address)} está fuera de rango.`);
      }
      return new DataView(get().memory).getUint8(address);
    } else {
      if (address < MIN_MEMORY_ADDRESS || address > MAX_MEMORY_ADDRESS - 1) {
        throw new Error(`La dirección de memoria ${renderAddress(address)} está fuera de rango.`);
      }
      return new DataView(get().memory).getUint16(address, true);
    }
  },

  getRegister: register => {
    if (isMatching(partialRegisterPattern, register)) {
      return match(register)
        .with("AL", () => splitLowHigh(get().registers.AX)[0])
        .with("AH", () => splitLowHigh(get().registers.AX)[1])
        .with("BL", () => splitLowHigh(get().registers.BX)[0])
        .with("BH", () => splitLowHigh(get().registers.BX)[1])
        .with("CL", () => splitLowHigh(get().registers.CX)[0])
        .with("CH", () => splitLowHigh(get().registers.CX)[1])
        .with("DL", () => splitLowHigh(get().registers.DX)[0])
        .with("DH", () => splitLowHigh(get().registers.DX)[1])
        .exhaustive();
    } else {
      return get().registers[register];
    }
  },

  setMemory: (address, size, value) => {
    const memory = klona(get().memory);
    const program = get().program;

    if (size === "byte") {
      if (address < MIN_MEMORY_ADDRESS || address > MAX_MEMORY_ADDRESS) {
        throw new Error(`La dirección de memoria ${renderAddress(address)} está fuera de rango.`);
      }
      if (program && program.readonlyMemory.has(address)) {
        throw new Error(`La dirección de memoria ${renderAddress(address)} es de solo lectura.`);
      }
      new DataView(memory).setUint8(address, value);
    } else {
      if (address < MIN_MEMORY_ADDRESS || address > MAX_MEMORY_ADDRESS - 1) {
        throw new Error(`La dirección de memoria ${renderAddress(address)} está fuera de rango.`);
      }
      if (
        program &&
        (program.readonlyMemory.has(address) || program.readonlyMemory.has(address + 1))
      ) {
        throw new Error(`La dirección de memoria ${renderAddress(address)} es de solo lectura.`);
      }
      new DataView(memory).setUint16(address, value, true);
    }

    set({ memory });
  },

  setRegister: (register, value) => {
    if (isMatching(partialRegisterPattern, register)) {
      const [name, byte] = register.split("") as Split<typeof register, "">;
      const wordRegister = `${name}X` as const;

      let [low, high] = splitLowHigh(get().registers[wordRegister]);
      if (byte === "L") low = value;
      else if (byte === "H") high = value;

      set(state => ({
        ...state,
        registers: {
          ...state.registers,
          [wordRegister]: joinLowHigh(low, high),
        },
      }));
    } else {
      set(state => ({
        ...state,
        registers: {
          ...state.registers,
          [register]: value,
        },
      }));
    }
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
    if (flags.carry) bits |= 0b1000;
    if (flags.overflow) bits |= 0b0100;
    if (flags.sign) bits |= 0b0010;
    if (flags.zero) bits |= 0b0001;
    return bits;
  },

  decodeFlags: bits => {
    const flags = {
      carry: (bits & 0b1000) !== 0,
      overflow: (bits & 0b0100) !== 0,
      sign: (bits & 0b0010) !== 0,
      zero: (bits & 0b0001) !== 0,
    };
    set(state => ({
      ...state,
      alu: { ...state.alu, flags },
    }));
  },

  loadProgram: program => {
    const memoryConfig = useConfig.getState().memoryOnReset;

    const memory: ArrayBuffer =
      memoryConfig === "empty"
        ? new ArrayBuffer(MEMORY_SIZE)
        : memoryConfig === "random"
        ? new Uint8Array(MEMORY_SIZE).map(() => Math.round(Math.random() * MAX_BYTE_VALUE)).buffer
        : klona(get().memory);

    programToBytecode(memory, program);

    set({
      memory,
      program,
      registers: {
        IP: INITIAL_IP,
        IR: 0,
        SP: MEMORY_SIZE,
        MAR: 0,
        MBR: 0,
        ...(memoryConfig === "empty"
          ? { AX: 0, BX: 0, CX: 0, DX: 0 }
          : memoryConfig === "random"
          ? {
              AX: Math.random() * MAX_WORD_VALUE,
              BX: Math.random() * MAX_WORD_VALUE,
              CX: Math.random() * MAX_WORD_VALUE,
              DX: Math.random() * MAX_WORD_VALUE,
            }
          : {
              AX: get().registers.AX,
              BX: get().registers.BX,
              CX: get().registers.CX,
              DX: get().registers.DX,
            }),
      },
    });
  },

  runInstruction,
}));
