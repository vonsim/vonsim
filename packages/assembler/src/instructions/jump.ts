import { Byte, ByteSize } from "@vonsim/common/byte";
import type { TupleToUnion } from "type-fest";

import { CompilerError } from "@/error";
import type { GlobalStore } from "@/global-store";
import type { InstructionStatement } from "@/parser/statement";
import type { Position } from "@/position";

import { Instruction } from ".";

type JumpInstructionName = TupleToUnion<typeof JumpInstruction.INSTRUCTIONS>;
type JumpInstructionStatement = InstructionStatement & { instruction: JumpInstructionName };

/**
 * JumpInstruction:
 * CALL, JZ, JNZ, JS, JNS, JC, JNC, JO, JNO, JMP
 *
 * These instructions needs one operand: a label to jump to.
 * The label must be an instruction label.
 * It NEEDS to be a label and not a direct address.
 *
 * ---
 * This class is: MUTABLE
 */
export class JumpInstruction extends Instruction {
  static readonly INSTRUCTIONS = [
    "CALL",
    "JZ",
    "JNZ",
    "JS",
    "JNS",
    "JC",
    "JNC",
    "JO",
    "JNO",
    "JMP",
  ] as const;

  readonly name: JumpInstructionName;
  #jumpTo: string;
  #disp: Byte | null = null;

  private constructor(attrs: {
    name: JumpInstructionName;
    label: string | null;
    position: Position;
    jumpTo: string;
  }) {
    super(attrs.name, attrs.label, structuredClone(attrs.position));
    this.name = attrs.name;
    this.#jumpTo = attrs.jumpTo;
  }

  /**
   * Returns the length of the instruction in bytes.
   * @see /docs/especificaciones/codificacion.md
   */
  get length(): number {
    if (this.name === "CALL" || this.name === "JMP") return 3;
    else return 2;
  }

  /**
   * Returns jump displacement (8 or 16 bits).
   */
  get disp(): Byte {
    if (this.#disp === null) {
      throw new Error("Displacement not set");
    }

    return this.#disp;
  }

  evaluateExpressions(store: GlobalStore): void {
    const address = store.getLabelValue(this.#jumpTo)!;
    const disp = address - (this.start.value + this.length);

    const dispSize: ByteSize = this.name === "CALL" || this.name === "JMP" ? 16 : 8;

    if (!Byte.fitsSigned(disp, dispSize)) {
      throw new CompilerError("jump-too-far", disp, dispSize).at(this);
    }

    this.#disp = Byte.fromSigned(disp, dispSize);
  }

  static isJump(statement: InstructionStatement): statement is JumpInstructionStatement {
    return JumpInstruction.INSTRUCTIONS.includes(statement.instruction);
  }

  static fromStatement(statement: JumpInstructionStatement, store: GlobalStore): JumpInstruction {
    if (statement.operands.length !== 1) {
      throw new CompilerError("expects-one-operand").at(statement);
    }

    const operand = statement.operands[0];
    if (!operand.isNumberExpression() || !operand.value.isLabel()) {
      throw new CompilerError("expects-label").at(operand);
    }

    const label = operand.value.value;
    const type = store.getLabelType(label);

    if (!type) {
      throw new CompilerError("label-not-found", label).at(operand);
    }
    if (type !== "instruction") {
      throw new CompilerError("label-should-be-an-instruction", label).at(operand);
    }

    return new JumpInstruction({
      name: statement.instruction,
      label: statement.label,
      position: statement.position,
      jumpTo: label,
    });
  }
}
