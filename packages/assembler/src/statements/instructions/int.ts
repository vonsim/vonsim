import { Byte } from "@vonsim/common/byte";

import { CompilerError } from "@/error";
import type { GlobalStore } from "@/global-store";
import { NumberExpression } from "@/number-expression";
import type { Position } from "@/position";

import { InstructionStatement } from ".";
import type { Operand } from "./operands";

type IntInstructionName = "INT";

/**
 * IntInstruction:
 * INT
 *
 * This instruction needs one operand: an immediate value.
 *
 * ---
 * This class is: MUTABLE
 */
export class IntInstruction extends InstructionStatement {
  #initialValue: NumberExpression | null = null;
  #value: Byte | null = null;

  constructor(
    readonly instruction: IntInstructionName,
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
    return 2;
  }

  /**
   * Returns the interrput number (8 bits).
   */
  get value(): Byte {
    if (!this.#value) throw new Error("Instruction not evaluated");

    return this.#value;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      int: this.#value?.toJSON(),
    };
  }

  validate() {
    if (this.#initialValue) throw new Error("Instruction already validated");

    if (this.operands.length !== 1) {
      throw new CompilerError("expects-one-operand").at(this);
    }

    const operand = this.operands[0];

    if (!operand.isNumberExpression()) {
      throw new CompilerError("expects-immediate").at(operand);
    }

    this.#initialValue = operand.value;
  }

  evaluateExpressions(store: GlobalStore) {
    if (!this.#initialValue) throw new Error("Instruction not validated");
    if (this.#value) throw new Error("Instruction aready evaluated");

    const computed = this.#initialValue.evaluate(store);
    if (!Byte.fitsUnsigned(computed, 8)) {
      throw new CompilerError("invalid-interrupt", computed).at(this.#initialValue);
    }

    this.#value = Byte.fromUnsigned(computed, 8);
  }
}
