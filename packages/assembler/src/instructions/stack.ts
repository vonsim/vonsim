import type { TupleToUnion } from "type-fest";

import { CompilerError } from "@/error";
import type { InstructionStatement } from "@/parser/statement";
import type { Position } from "@/position";
import type { WordRegisterName } from "@/types";

import { Instruction } from ".";

type StackInstructionName = TupleToUnion<typeof StackInstruction.INSTRUCTIONS>;
type StackInstructionStatement = InstructionStatement & { instruction: StackInstructionName };

/**
 * StackInstruction:
 * PUSH, POP
 *
 * These instructions need one operand from {@link InstructionStatement}:
 * - `out`: the destination operand
 *
 * The operand must be a 16-bit register.
 *
 * ---
 * This class is: IMMUTABLE
 */
export class StackInstruction extends Instruction {
  static readonly INSTRUCTIONS = ["PUSH", "POP"] as const;

  private constructor(
    readonly name: StackInstructionName,
    label: string | null,
    readonly register: WordRegisterName,
    position: Position,
  ) {
    super(name, label, structuredClone(position));
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
    // Stack instructions don't have expressions to evaluate.
    return;
  }

  static isStack(statement: InstructionStatement): statement is StackInstructionStatement {
    return StackInstruction.INSTRUCTIONS.includes(statement.instruction);
  }

  static fromStatement(statement: StackInstructionStatement): StackInstruction {
    if (statement.operands.length !== 1) {
      throw new CompilerError("expects-one-operand").at(statement);
    }

    const operand = statement.operands[0];
    if (!operand.isRegister() || operand.size !== 16) {
      throw new CompilerError("expects-word-register").at(operand);
    }

    return new StackInstruction(
      statement.instruction,
      statement.label,
      operand.value as WordRegisterName,
      statement.position,
    );
  }
}
