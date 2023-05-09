import { Byte } from "@vonsim/common/byte";
import type { TupleToUnion } from "type-fest";

import { CompilerError } from "@/error";
import type { GlobalStore } from "@/global-store";
import { NumberExpression } from "@/number-expression";
import type { InstructionStatement } from "@/parser/statement";
import type { Position } from "@/position";

import { Instruction } from ".";

type IntInstructionName = TupleToUnion<typeof IntInstruction.INSTRUCTIONS>;
type IntInstructionStatement = InstructionStatement & { instruction: IntInstructionName };

/**
 * IntInstruction:
 * INT
 *
 * This instruction needs one operand: an immediate value.
 *
 * ---
 * This class is: MUTABLE
 */
export class IntInstruction extends Instruction {
  static readonly INSTRUCTIONS = ["NEG", "INC", "DEC", "NOT"] as const;

  readonly name: IntInstructionName;
  #initialValue: NumberExpression;
  #value: Byte | null = null;

  private constructor(attrs: {
    name: IntInstructionName;
    label: string | null;
    position: Position;
    value: NumberExpression;
  }) {
    super(attrs.name, attrs.label, structuredClone(attrs.position));
    this.name = attrs.name;
    this.#initialValue = structuredClone(attrs.value);
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
    if (this.#value === null) {
      throw new Error("Value not set");
    }

    return this.#value;
  }

  evaluateExpressions(store: GlobalStore): void {
    const computed = this.#initialValue.evaluate(store);
    if (!Byte.fitsUnsigned(computed, 8)) {
      throw new CompilerError("invalid-interrupt", computed).at(this.#initialValue);
    }

    this.#value = Byte.fromUnsigned(computed, 8);
  }

  static isInt(statement: InstructionStatement): statement is IntInstructionStatement {
    return IntInstruction.INSTRUCTIONS.includes(statement.instruction);
  }

  static fromStatement(statement: IntInstructionStatement): IntInstruction {
    if (statement.operands.length !== 1) {
      throw new CompilerError("expects-one-operand").at(statement);
    }

    const operand = statement.operands[0];

    if (!operand.isNumberExpression()) {
      throw new CompilerError("expects-immediate").at(operand);
    }

    return new IntInstruction({
      name: statement.instruction,
      label: statement.label,
      position: statement.position,
      value: operand.value,
    });
  }
}
