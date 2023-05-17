import { CompilerError } from "../../../error";
import type { Position } from "../../../position";
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
  get length(): number {
    // These instructions are all 1 byte long.
    return 1;
  }

  validate() {
    if (this.#validated) throw new Error("Instruction already validated");

    if (this.operands.length > 0) {
      throw new CompilerError("expects-no-operands").at(this);
    }

    this.#validated = true;
  }

  evaluateExpressions() {
    if (!this.#validated) throw new Error("Instruction not validated");

    // Zeroary instructions don't have expressions to evaluate.
    return;
  }
}
