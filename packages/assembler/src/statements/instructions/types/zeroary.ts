import type { Position } from "@vonsim/common/position";

import { AssemblerError } from "../../../error";
import type { Operand } from "../operands";
import { InstructionStatement } from "../statement";

type ZeroaryInstructionName = "PUSHF" | "POPF" | "RET" | "IRET" | "CLI" | "STI" | "NOP" | "HLT";

/**
 * ZeroaryInstruction:
 * PUSHF, POPF, RET, IRET, CLI, STI, NOP, HLT
 *
 * These instructions don't have operands.
 *
 * ---
 * This class is: MUTABLE
 */
export class ZeroaryInstruction extends InstructionStatement {
  #validated = false;

  constructor(
    readonly instruction: ZeroaryInstructionName,
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
  readonly length = 1;

  /**
   * Returns the bytes of the instruction.
   * @see /docs/especificaciones/codificacion.md
   */
  toBytes(): Uint8Array {
    const opcodes: { [key in ZeroaryInstructionName]: number } = {
      PUSHF: 0b0111_0000,
      POPF: 0b0111_1000,
      RET: 0b0011_0011,
      CLI: 0b0001_1000,
      STI: 0b0001_1001,
      IRET: 0b0011_1011,
      NOP: 0b0001_0000,
      HLT: 0b0001_0001,
    };
    return new Uint8Array([opcodes[this.instruction]]);
  }

  validate() {
    if (this.#validated) throw new Error("Instruction already validated");

    if (this.operands.length > 0) {
      throw new AssemblerError("expects-no-operands").at(this);
    }

    this.#validated = true;
  }

  evaluateExpressions() {
    if (!this.#validated) throw new Error("Instruction not validated");

    // Zeroary instructions don't have expressions to evaluate.
    return;
  }
}
