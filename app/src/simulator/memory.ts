/**
 * The Memory module
 *
 * It's meant to be as dumb as possible. It just stores and retrieves data from
 * the memory. It doesn't care about the data it's storing, it just stores it.
 */

import { Err, Ok } from "rust-optionals";
import { match } from "ts-pattern";

import type { Program } from "@/compiler";
import type { InstructionType, RegisterType } from "@/compiler/common";
import {
  binaryInstructionPattern,
  intInstructionPattern,
  ioInstructionPattern,
  jumpInstructionPattern,
  stackInstructionPattern,
  unaryInstructionPattern,
  zeroaryInstructionPattern,
} from "@/compiler/common/patterns";
import { MAX_MEMORY_ADDRESS, MEMORY_SIZE, MIN_MEMORY_ADDRESS, Size } from "@/config";
import { randomByte, splitLowHigh } from "@/helpers";
import { Jsonable, MemoryMode, SimulatorError, SimulatorResult } from "@/simulator/common";

export type MemoryOptions = { program: Program; mode: MemoryMode };

export class Memory implements Jsonable {
  #buffer = new ArrayBuffer(MEMORY_SIZE);
  #codeMemory: Program["codeMemory"] = new Set();

  #writeByte(address: number, value: number) {
    new DataView(this.#buffer).setUint8(address, value);
  }

  #writeWord(address: number, value: number) {
    new DataView(this.#buffer).setUint16(address, value, true);
  }

  reset({ program, mode }: MemoryOptions) {
    this.#codeMemory = structuredClone(program.codeMemory);

    // Initialize buffer
    if (mode === "randomize") this.#buffer = new Uint8Array(MEMORY_SIZE).map(randomByte).buffer;
    else if (mode === "empty") this.#buffer = new ArrayBuffer(MEMORY_SIZE);

    // Load program given by simulator
    for (const data of program.data) {
      let address = data.meta.start;

      if (data.size === "word") {
        for (const value of data.initialValues) {
          if (typeof value === "number") this.#writeWord(address, value);
          address += 2;
        }
      } else {
        for (const value of data.initialValues) {
          if (typeof value === "number") this.#writeByte(address, value);
          address += 1;
        }
      }
    }

    for (const instruction of program.instructions) {
      let opcode: number = INSTRUCTION_TO_OPCODE[instruction.type];
      const operands: number[] = [];

      match(instruction)
        .with({ type: zeroaryInstructionPattern }, () => [])
        .with({ type: binaryInstructionPattern }, ({ opSize, out, src }) => {
          if (out.type === "register") {
            operands.push(REGISTER_TO_BINARY[out.register]);
          } else if (out.mode === "direct") {
            operands.push(...splitLowHigh(out.address));
          }

          if (src.type === "register") {
            operands.push(REGISTER_TO_BINARY[src.register]);
          } else if (src.type === "immediate") {
            if (opSize === "word") operands.push(...splitLowHigh(src.value));
            else operands.push(src.value);
          } else if (src.mode === "direct") {
            operands.push(...splitLowHigh(src.address));
          }

          // Adds DDD part (see /docs/especificaciones/codificacion)
          opcode |=
            match([out, src] as const)
              .with([{ type: "register" }, { type: "register" }], () => 0b000)
              .with([{ type: "register" }, { type: "memory", mode: "direct" }], () => 0b001)
              .with([{ type: "register" }, { type: "memory", mode: "indirect" }], () => 0b010)
              .with([{ type: "register" }, { type: "immediate" }], () => 0b011)
              .with([{ type: "memory", mode: "direct" }, { type: "register" }], () => 0b100)
              .with([{ type: "memory", mode: "indirect" }, { type: "register" }], () => 0b101)
              .with([{ type: "memory", mode: "direct" }, { type: "immediate" }], () => 0b110)
              .with([{ type: "memory", mode: "indirect" }, { type: "immediate" }], () => 0b111)
              .with([{ type: "memory" }, { type: "memory" }], () => 0b000) // never should happen
              .exhaustive() << 1;

          if (opSize === "word") opcode |= 0b0000_0001;
        })
        .with({ type: unaryInstructionPattern }, ({ opSize, out }) => {
          if (out.type === "register") {
            operands.push(REGISTER_TO_BINARY[out.register]);
          } else if (out.mode === "direct") {
            opcode |= 0b0000_0010;
            operands.push(...splitLowHigh(out.address));
          } else {
            opcode |= 0b0000_0100;
          }

          if (opSize === "word") opcode |= 0b0000_0001;
        })
        .with({ type: stackInstructionPattern }, ({ register }) => {
          operands.push(REGISTER_TO_BINARY[register]);
        })
        .with({ type: jumpInstructionPattern }, ({ jumpTo }) => {
          operands.push(...splitLowHigh(jumpTo));
        })
        .with({ type: ioInstructionPattern }, ({ opSize, port }) => {
          if (port.type === "fixed") {
            operands.push(port.value);
          } else if (port.type === "variable") {
            opcode |= 0b0000_0010;
          }

          if (opSize === "word") opcode |= 0b0000_0001;
        })
        .with({ type: intInstructionPattern }, ({ interrupt }) => {
          operands.push(interrupt);
        })
        .exhaustive();

      new Uint8Array(this.#buffer).set([opcode, ...operands], instruction.meta.start);
    }
  }

  get(address: number, size: Size): SimulatorResult<number> {
    let value: number;

    if (size === "byte") {
      if (address < MIN_MEMORY_ADDRESS || address > MAX_MEMORY_ADDRESS) {
        return Err(new SimulatorError("address-out-of-range", address));
      }
      value = new DataView(this.#buffer).getUint8(address);
    } else {
      if (address < MIN_MEMORY_ADDRESS || address > MAX_MEMORY_ADDRESS - 1) {
        return Err(new SimulatorError("address-out-of-range", address));
      }
      value = new DataView(this.#buffer).getUint16(address, true);
    }

    return Ok(value);
  }

  set(address: number, size: Size, value: number): SimulatorResult<void> {
    if (size === "byte") {
      if (address < MIN_MEMORY_ADDRESS || address > MAX_MEMORY_ADDRESS) {
        return Err(new SimulatorError("address-out-of-range", address));
      }
      if (this.#codeMemory.has(address)) {
        return Err(new SimulatorError("address-has-instruction", address));
      }
      new DataView(this.#buffer).setUint8(address, value);
    } else {
      if (address < MIN_MEMORY_ADDRESS || address > MAX_MEMORY_ADDRESS - 1) {
        return Err(new SimulatorError("address-out-of-range", address));
      }
      if (this.#codeMemory.has(address) || this.#codeMemory.has(address + 1)) {
        return Err(new SimulatorError("address-has-instruction", address));
      }
      new DataView(this.#buffer).setUint16(address, value, true);
    }

    return Ok();
  }

  toJSON() {
    return [...new Uint8Array(this.#buffer)];
  }
}

const INSTRUCTION_TO_OPCODE: { [key in InstructionType]: number } = {
  // Zeroary
  PUSHF: 0b1100_0010,
  POPF: 0b1100_0011,
  RET: 0b1110_0010,
  IRET: 0b1111_1011,
  CLI: 0b1111_1100,
  STI: 0b1111_1101,
  NOP: 0b1111_1110,
  HLT: 0b1111_1111,

  // Binary - last four bits are 0b0000 as a placeholder
  MOV: 0b0000_0000,
  AND: 0b0001_0000,
  OR: 0b0010_0000,
  ADD: 0b0100_0000,
  XOR: 0b0011_0000,
  ADC: 0b0101_0000,
  SUB: 0b0110_0000,
  SBB: 0b0111_0000,
  CMP: 0b1000_0000,

  // Unary - last three bits are 0b000 as a placeholder
  NOT: 0b101_00_000,
  INC: 0b101_01_000,
  DEC: 0b101_10_000,
  NEG: 0b101_11_000,

  // Stack
  PUSH: 0b1100_0000,
  POP: 0b1100_0001,

  // Jump
  JMP: 0b1110_0000,
  CALL: 0b1110_0001,
  JZ: 0b1110_1110,
  JNZ: 0b1110_1111,
  JS: 0b1110_1100,
  JNS: 0b1110_1101,
  JC: 0b1110_1000,
  JNC: 0b1110_1001,
  JO: 0b1110_1010,
  JNO: 0b1110_1011,

  // I/O - last two bits are 0b00 as a placeholder
  IN: 0b1100_1000,
  OUT: 0b1100_1100,

  // Interrupt
  INT: 0b1111_1010,
};

const REGISTER_TO_BINARY: { [key in RegisterType]: number } = {
  AL: 0b0000_0000,
  BL: 0b0000_0001,
  CL: 0b0000_0010,
  DL: 0b0000_0011,
  AH: 0b0100_0000,
  BH: 0b0100_0001,
  CH: 0b0100_0010,
  DH: 0b0100_0011,
  AX: 0b1000_0000,
  BX: 0b1000_0001,
  CX: 0b1000_0010,
  DX: 0b1000_0011,
  IP: 0b1010_0000,
  SP: 0b1010_0001,
  IR: 0b1010_0010,
  MAR: 0b1010_0011,
  MBR: 0b1010_0100,
};
