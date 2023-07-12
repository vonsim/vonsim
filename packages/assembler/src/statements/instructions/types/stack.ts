import type { Position } from "@vonsim/common/position";

import { AssemblerError } from "../../../error";
import type { WordRegister } from "../../../types";
import { registerToBits } from "../encoding";
import type { Operand } from "../operands";
import { InstructionStatement } from "../statement";

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

  /**
   * Returns the bytes of the instruction.
   * @see /docs/especificaciones/codificacion.md
   */
  toBytes(): Uint8Array {
    const opcodes: { [key in StackInstructionName]: number } = {
      PUSH: 0b01100_000,
      POP: 0b01101_000,
    };

    let byte = opcodes[this.instruction];
    byte |= registerToBits(this.register);
    return new Uint8Array([byte]);
  }

  get register(): WordRegister {
    if (!this.#register) throw new Error("Instruction not evaluated");

    return this.#register;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      ...(this.#register
        ? { register: this.#register }
        : { operands: this.operands.map(o => o.toJSON()) }),
    };
  }

  validate() {
    if (this.#register) throw new Error("Instruction already validated");

    if (this.operands.length !== 1) {
      throw new AssemblerError("expects-one-operand").at(this);
    }

    const operand = this.operands[0];
    if (!operand.isRegister() || operand.size !== 16) {
      throw new AssemblerError("expects-word-register").at(operand);
    }

    this.#register = operand.value as WordRegister;
  }

  evaluateExpressions(): void {
    if (!this.#register) throw new Error("Instruction not validated");

    // Stack instructions don't have expressions to evaluate.
    return;
  }
}
