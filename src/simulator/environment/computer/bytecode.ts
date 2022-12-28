import { match } from "ts-pattern";
import type { Program } from "~/compiler";
import type { InstructionType, RegisterType } from "~/compiler/common";
import {
  binaryInstructionPattern,
  intInstructionPattern,
  ioInstructionPattern,
  jumpInstructionPattern,
  stackInstructionPattern,
  unaryInstructionPattern,
  zeroaryInstructionPattern,
} from "~/compiler/common/patterns";
import { numberToWord } from "../helpers";

export const INSTRUCTION_TO_OPCODE: { [key in InstructionType]: number } = {
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

  // I/O - last three bits are 0b000 as a placeholder
  IN: 0b1101_0000,
  OUT: 0b1101_1000,

  // Interrupt
  INT: 0b1111_1010,
};

export const REGISTER_TO_BINARY: { [key in RegisterType]: number } = {
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

const writeWord = (memory: number[], address: number, value: number): void => {
  const [low, high] = numberToWord(value);
  memory[address] = low;
  memory[address + 1] = high;
};

export function programToBytecode(memory: number[], program: Program) {
  for (const data of program.data) {
    let address = data.meta.start;

    if (data.size === "word") {
      for (const value of data.initialValues) {
        if (typeof value === "number") writeWord(memory, address, value);
        address += 2;
      }
    } else {
      for (const value of data.initialValues) {
        if (typeof value === "number") memory[address] = value;
        address += 1;
      }
    }
  }

  for (const instruction of program.instructions) {
    let opcode: number = INSTRUCTION_TO_OPCODE[instruction.type];
    let operands: number[] = [];

    match(instruction)
      .with({ type: zeroaryInstructionPattern }, () => [])
      .with({ type: binaryInstructionPattern }, ({ opSize, out, src }) => {
        if (out.type === "register") {
          operands.push(REGISTER_TO_BINARY[out.register]);
        } else if (out.mode === "direct") {
          operands.push(...numberToWord(out.address));
        }

        if (src.type === "register") {
          operands.push(REGISTER_TO_BINARY[src.register]);
        } else if (src.type === "immediate") {
          if (opSize === "word") operands.push(...numberToWord(src.value));
          else operands.push(src.value);
        } else if (src.mode === "direct") {
          operands.push(...numberToWord(src.address));
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
          operands.push(...numberToWord(out.address));
        } else {
          opcode |= 0b0000_0100;
        }

        if (opSize === "word") opcode |= 0b0000_0001;
      })
      .with({ type: stackInstructionPattern }, ({ out }) => {
        operands.push(REGISTER_TO_BINARY[out]);
      })
      .with({ type: jumpInstructionPattern }, ({ jumpTo }) => {
        operands.push(...numberToWord(jumpTo));
      })
      .with({ type: ioInstructionPattern }, ({ opSize, port }) => {
        if (port.type === "immediate") {
          operands.push(port.value);
        } else if (port.type === "memory-direct") {
          opcode |= 0b0000_0010;
          operands.push(...numberToWord(port.address));
        } else {
          opcode |= 0b0000_0100;
        }

        if (opSize === "word") opcode |= 0b0000_0001;
      })
      .with({ type: intInstructionPattern }, ({ interruption }) => {
        operands.push(interruption);
      })
      .exhaustive();

    const bytecode = [opcode, ...operands];
    console.log(instruction, bytecode.map(x => x.toString(2).padStart(8, "0")).join(" "));
    memory.splice(instruction.meta.start, bytecode.length, ...bytecode);
  }
}
