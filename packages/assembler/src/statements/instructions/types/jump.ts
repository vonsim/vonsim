import { MemoryAddress } from "@vonsim/common/address";
import type { Position } from "@vonsim/common/position";

import { AssemblerError } from "../../../error";
import type { GlobalStore } from "../../../global-store";
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
  #address: MemoryAddress | null = null;

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
  readonly length = 3;

  /**
   * Returns the bytes of the instruction.
   * @see /docs/especificaciones/codificacion.md
   */
  toBytes(): Uint8Array {
    const bytes: number[] = [];

    const opcodes: { [key in JumpInstructionName]: number } = {
      JC: 0b0010_0000,
      JNC: 0b0010_0001,
      JZ: 0b0010_0010,
      JNZ: 0b0010_0011,
      JS: 0b0010_0100,
      JNS: 0b0010_0101,
      JO: 0b0010_0110,
      JNO: 0b0010_0111,
      JMP: 0b0011_0000,
      CALL: 0b0011_0001,
    };

    bytes.push(opcodes[this.instruction]);
    bytes.push(this.address.byte.low.unsigned);
    bytes.push(this.address.byte.high.unsigned);

    return new Uint8Array(bytes);
  }

  /**
   * Returns jump destination.
   */
  get address(): MemoryAddress {
    if (this.#address === null) throw new Error("Instruction not evaluated");

    return this.#address;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      ...(this.#address
        ? { address: this.#address.toJSON() }
        : this.#jumpTo
        ? { jumpTo: this.#jumpTo }
        : { operands: this.operands.map(o => o.toJSON()) }),
    };
  }

  validate(store: GlobalStore) {
    if (this.#jumpTo) throw new Error("Instruction already validated");

    if (this.operands.length !== 1) {
      throw new AssemblerError("expects-one-operand").at(this);
    }

    const operand = this.operands[0];
    if (!operand.isNumberExpression() || !operand.value.isLabel()) {
      throw new AssemblerError("expects-label").at(operand);
    }

    const label = operand.value.value;
    const type = store.getLabelType(label);

    if (!type) {
      throw new AssemblerError("label-not-found", label).at(operand);
    }
    if (type !== "instruction") {
      throw new AssemblerError("label-should-be-an-instruction", label).at(operand);
    }

    this.#jumpTo = label;
  }

  evaluateExpressions(store: GlobalStore) {
    if (!this.#jumpTo) throw new Error("Instruction not validated");
    if (this.#address) throw new Error("Instruction aready evaluated");

    const addr = store.getLabelValue(this.#jumpTo)!;
    if (!MemoryAddress.inRange(addr)) {
      throw new AssemblerError("address-out-of-range", addr).at(this);
    }

    this.#address = MemoryAddress.from(addr);
  }
}
