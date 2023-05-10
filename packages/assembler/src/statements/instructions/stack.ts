import { CompilerError } from "@/error";
import type { Position } from "@/position";
import type { WordRegister } from "@/types";

import { InstructionStatement } from ".";
import type { Operand } from "./operands";

type StackInstructionName = "PUSH" | "POP";

/**
 * StackInstruction:
 * PUSH, POP
 *
 * These instructions need one operand:
 * - `out`: the destination operand
 *
 * The operand must be a 16-bit register.
 *
 * ---
 * This class is: MUTABLE
 */
export class StackInstruction extends InstructionStatement {
  #register: WordRegister | null = null;

  constructor(
    readonly instruction: StackInstructionName,
    operands: Operand[],
    label: string | null,
    position: Position,
  ) {
    super(operands, label, position);
  }

  /**
   * Returns the length of the instruction in bytes.
   * @see /docs/especificaciones/codificacion.md
   */
  get length(): number {
    // These instructions are all 1 byte long.
    return 1;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      register: this.#register,
    };
  }

  validate() {
    if (this.#register) throw new Error("Instruction already validated");

    if (this.operands.length !== 1) {
      throw new CompilerError("expects-one-operand").at(this);
    }

    const operand = this.operands[0];
    if (!operand.isRegister() || operand.size !== 16) {
      throw new CompilerError("expects-word-register").at(operand);
    }

    this.#register = operand.value as WordRegister;
  }

  evaluateExpressions(): void {
    if (!this.#register) throw new Error("Instruction not validated");

    // Stack instructions don't have expressions to evaluate.
    return;
  }
}
