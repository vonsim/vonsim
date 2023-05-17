import type { Token } from "../../lexer/tokens";
import { Position } from "../../position";
import type { Instruction } from "../../types";
import type { Operand } from "./operands";
import type { InstructionStatementType } from "./statement";
import { BinaryInstruction } from "./types/binary";
import { IntInstruction } from "./types/int";
import { IOInstruction } from "./types/io";
import { JumpInstruction } from "./types/jump";
import { StackInstruction } from "./types/stack";
import { UnaryInstruction } from "./types/unary";
import { ZeroaryInstruction } from "./types/zeroary";

export function createInstructionStatement(
  token: Token & { type: Instruction },
  operands: Operand[],
  label: string | null,
): InstructionStatementType {
  const position = Position.merge(token.position, ...operands.map(op => op.position));

  switch (token.type) {
    case "PUSHF":
    case "POPF":
    case "RET":
    case "IRET":
    case "CLI":
    case "STI":
    case "NOP":
    case "HLT":
      return new ZeroaryInstruction(token.type, operands, label, position);
    case "MOV":
    case "ADD":
    case "ADC":
    case "SUB":
    case "SBB":
    case "CMP":
    case "AND":
    case "OR":
    case "XOR":
      return new BinaryInstruction(token.type, operands, label, position);
    case "NEG":
    case "INC":
    case "DEC":
    case "NOT":
      return new UnaryInstruction(token.type, operands, label, position);
    case "PUSH":
    case "POP":
      return new StackInstruction(token.type, operands, label, position);
    case "CALL":
    case "JZ":
    case "JNZ":
    case "JS":
    case "JNS":
    case "JC":
    case "JNC":
    case "JO":
    case "JNO":
    case "JMP":
      return new JumpInstruction(token.type, operands, label, position);
    case "IN":
    case "OUT":
      return new IOInstruction(token.type, operands, label, position);
    case "INT":
      return new IntInstruction(token.type, operands, label, position);
  }
}

export type { InstructionStatementType as InstructionStatement };
export * from "./operands";
export {
  BinaryInstruction,
  IntInstruction,
  IOInstruction,
  JumpInstruction,
  StackInstruction,
  UnaryInstruction,
  ZeroaryInstruction,
};
