import { Byte, ByteSize } from "@vonsim/common/byte";

import { CompilerError } from "@/error";
import type { GlobalStore } from "@/global-store";
import type { Position } from "@/position";

import type { Operand } from "../operands";
import { InstructionStatement } from "../statement";

type JumpInstructionName =
  | "CALL"
  | "JZ"
  | "JNZ"
  | "JS"
  | "JNS"
  | "JC"
  | "JNC"
  | "JO"
  | "JNO"
  | "JMP";

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
export class JumpInstruction extends InstructionStatement {
  #jumpTo: string | null = null;
  #disp: Byte | null = null;

  constructor(
    readonly instruction: JumpInstructionName,
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
    if (this.instruction === "CALL" || this.instruction === "JMP") return 3;
    else return 2;
  }

  /**
   * Returns jump displacement (8 or 16 bits).
   */
  get disp(): Byte {
    if (this.#disp === null) throw new Error("Instruction not evaluated");

    return this.#disp;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      disp: this.#disp?.toJSON(),
    };
  }

  validate(store: GlobalStore) {
    if (this.#jumpTo) throw new Error("Instruction already validated");

    if (this.operands.length !== 1) {
      throw new CompilerError("expects-one-operand").at(this);
    }

    const operand = this.operands[0];
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

    this.#jumpTo = label;
  }

  evaluateExpressions(store: GlobalStore) {
    if (!this.#jumpTo) throw new Error("Instruction not validated");
    if (this.#disp) throw new Error("Instruction aready evaluated");

    const address = store.getLabelValue(this.#jumpTo)!;
    const disp = address - (this.start.value + this.length);

    const dispSize: ByteSize = this.instruction === "CALL" || this.instruction === "JMP" ? 16 : 8;

    if (!Byte.fitsSigned(disp, dispSize)) {
      throw new CompilerError("jump-too-far", disp, dispSize).at(this);
    }

    this.#disp = Byte.fromSigned(disp, dispSize);
  }
}
