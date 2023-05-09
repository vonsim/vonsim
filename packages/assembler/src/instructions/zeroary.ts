import type { TupleToUnion } from "type-fest";

import { CompilerError } from "@/error";
import type { InstructionStatement } from "@/parser/statement";
import type { Position } from "@/position";

import { Instruction } from ".";

type ZeroaryInstructionName = TupleToUnion<typeof ZeroaryInstruction.INSTRUCTIONS>;
type ZeroaryInstructionStatement = InstructionStatement & { instruction: ZeroaryInstructionName };

/**
 * ZeroaryInstruction:
 * PUSHF, POPF, RET, IRET, CLI, STI, NOP, HLT
 *
 * These instructions don't have operands.
 *
 * ---
 * This class is: IMMUTABLE
 */
export class ZeroaryInstruction extends Instruction {
  static readonly INSTRUCTIONS = [
    "PUSHF",
    "POPF",
    "RET",
    "IRET",
    "CLI",
    "STI",
    "NOP",
    "HLT",
  ] as const;

  private constructor(
    readonly name: ZeroaryInstructionName,
    label: string | null,
    position: Position,
  ) {
    super(name, label, position);
  }

  /**
   * Returns the length of the instruction in bytes.
   * @see /docs/especificaciones/codificacion.md
   */
  get length(): number {
    // These instructions are all 1 byte long.
    return 1;
  }

  evaluateExpressions(): void {
    // Zeroary instructions don't have expressions to evaluate.
    return;
  }

  static isZeroary(statement: InstructionStatement): statement is ZeroaryInstructionStatement {
    return ZeroaryInstruction.INSTRUCTIONS.includes(statement.instruction);
  }

  static fromStatement(statement: ZeroaryInstructionStatement): ZeroaryInstruction {
    if (statement.operands.length > 0) {
      throw new CompilerError("expects-no-operands").at(statement);
    }

    return new ZeroaryInstruction(statement.instruction, statement.label, statement.position);
  }
}
