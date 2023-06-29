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
