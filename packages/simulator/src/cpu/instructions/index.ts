import type { InstructionStatement } from "@vonsim/assembler";

import { ALUBinaryInstruction } from "./alu-binary";
import { ALUUnaryInstruction } from "./alu-unary";
import { INTInstruction } from "./int";
import { IOInstruction } from "./io";
import { JumpInstruction } from "./jump";
import { MiscInstruction } from "./misc";
import { MOVInstruction } from "./mov";
import { ReturnInstruction } from "./return";
import { StackInstruction } from "./stack";

export type InstructionType =
  | ALUBinaryInstruction
  | ALUUnaryInstruction
  | INTInstruction
  | IOInstruction
  | JumpInstruction
  | MiscInstruction
  | MOVInstruction
  | ReturnInstruction
  | StackInstruction;

type PickInstruction<T extends InstructionStatement["instruction"]> = InstructionStatement & {
  instruction: T;
};

/**
 * Converts an instruction statement from the assembler to an instruction type,
 * adding necessary execution logic to the instruction.
 * For convenience, similar instructions are grouped together.
 */
export function statementToInstruction(statement: InstructionStatement): InstructionType {
  switch (statement.instruction) {
    case "MOV":
      return new MOVInstruction(statement as PickInstruction<"MOV">);
    case "AND":
    case "OR":
    case "XOR":
    case "ADD":
    case "ADC":
    case "SUB":
    case "SBB":
    case "CMP":
    case "TEST":
      return new ALUBinaryInstruction(
        statement as PickInstruction<
          "AND" | "OR" | "XOR" | "ADD" | "ADC" | "SUB" | "SBB" | "CMP" | "TEST"
        >,
      );
    case "NOT":
    case "NEG":
    case "INC":
    case "DEC":
      return new ALUUnaryInstruction(statement as PickInstruction<"NOT" | "NEG" | "INC" | "DEC">);
    case "IN":
    case "OUT":
      return new IOInstruction(statement as PickInstruction<"IN" | "OUT">);
    case "PUSH":
    case "POP":
    case "PUSHF":
    case "POPF":
      return new StackInstruction(statement as PickInstruction<"PUSH" | "POP" | "PUSHF" | "POPF">);
    case "JC":
    case "JNC":
    case "JZ":
    case "JNZ":
    case "JS":
    case "JNS":
    case "JO":
    case "JNO":
    case "JMP":
    case "CALL":
      return new JumpInstruction(
        statement as PickInstruction<
          "JC" | "JNC" | "JZ" | "JNZ" | "JS" | "JNS" | "JO" | "JNO" | "JMP" | "CALL"
        >,
      );
    case "RET":
    case "IRET":
      return new ReturnInstruction(statement as PickInstruction<"RET" | "IRET">);
    case "INT":
      return new INTInstruction(statement as PickInstruction<"INT">);
    case "CLI":
    case "STI":
    case "NOP":
    case "HLT":
      return new MiscInstruction(statement as PickInstruction<"CLI" | "STI" | "NOP" | "HLT">);
  }
}
