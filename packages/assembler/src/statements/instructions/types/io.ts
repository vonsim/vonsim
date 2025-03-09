import { IOAddress } from "@vonsim/common/address";
import type { ByteSize } from "@vonsim/common/byte";
import type { Position } from "@vonsim/common/position";

import { AssemblerError } from "../../../error";
import type { GlobalStore } from "../../../global-store";
import type { NumberExpression } from "../../../number-expression";
import type { Operand } from "../operands";
import { InstructionStatement } from "../statement";

type IOInstructionName = "IN" | "OUT";

type InitialOperation =
  | { port: "fixed"; size: ByteSize; address: NumberExpression }
  | { port: "variable"; size: ByteSize };

type Operation =
  | { port: "fixed"; size: ByteSize; address: IOAddress }
  | { port: "variable"; size: ByteSize };

/**
 * IOInstruction:
 * - {@link https://vonsim.github.io/en/computer/instructions/in | IN}
 * - {@link https://vonsim.github.io/en/computer/instructions/out | OUT}
 *
 * These instructions need two operands:
 * - the register `AL` or `AX`
 * - the port (either immediate or `DX`)
 *
 * These instructions will be like:
 * - IN [reg], [port]
 * - OUT [port], [reg]
 *
 * ---
 * This class is: MUTABLE
 */
export class IOInstruction extends InstructionStatement {
  #initialOperation: InitialOperation | null = null;
  #operation: Operation | null = null;

  constructor(
    readonly instruction: IOInstructionName,
    operands: Operand[],
    label: string | null,
    position: Position,
  ) {
    super(operands, label, position);
  }

  /**
   * Returns the length of the instruction in bytes.
   * @see https://vonsim.github.io/en/reference/encoding
   */
  get length(): number {
    if (!this.#initialOperation) throw new Error("Instruction not validated");

    if (this.#initialOperation.port === "fixed") return 2;
    else return 1;
  }

  /**
   * Returns the bytes of the instruction.
   * @see https://vonsim.github.io/en/reference/encoding
   */
  toBytes(): Uint8Array {
    const bytes: number[] = [];

    const opcodes: Record<IOInstructionName, number> = {
      IN: 0b0101_00_00,
      OUT: 0b0101_01_00,
    };
    bytes[0] = opcodes[this.instruction];

    if (this.operation.size === 16) bytes[0] |= 1;

    if (this.operation.port === "fixed") {
      bytes[1] = this.operation.address.value;
    } else {
      bytes[0] |= 0b10;
    }

    return new Uint8Array(bytes);
  }

  get operation(): Operation {
    if (this.#operation === null) {
      throw new Error("Operation not set");
    }

    return this.#operation;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      ...(this.#operation ??
        this.#initialOperation ?? { operands: this.operands.map(o => o.toJSON()) }),
    };
  }

  validate() {
    if (this.#initialOperation) throw new Error("Instruction already validated");

    if (this.operands.length !== 2) {
      throw new AssemblerError("expects-two-operands").at(this);
    }

    const internal = this.operands[this.instruction === "IN" ? 0 : 1];
    const external = this.operands[this.instruction === "IN" ? 1 : 0];

    if (!internal.isRegister() || (internal.value !== "AL" && internal.value !== "AX")) {
      throw new AssemblerError("expects-ax").at(internal);
    }

    const size: ByteSize = internal.value === "AX" ? 16 : 8;

    if (external.isRegister()) {
      if (external.value !== "DX") {
        throw new AssemblerError("expects-dx").at(external);
      }

      this.#initialOperation = { port: "variable", size };
      return;
    }

    if (external.isNumberExpression()) {
      this.#initialOperation = { port: "fixed", size, address: external.value };
      return;
    }

    // external isn't a number expression
    throw new AssemblerError("expects-immediate").at(external);
  }

  evaluateExpressions(store: GlobalStore) {
    if (!this.#initialOperation) throw new Error("Instruction not validated");
    if (this.#operation) throw new Error("Instruction aready evaluated");

    const op = this.#initialOperation;

    if (op.port === "fixed") {
      const computed = op.address.evaluate(store);
      if (!IOAddress.inRange(computed)) {
        throw new AssemblerError("io-address-out-of-range", computed).at(this);
      }

      const address = IOAddress.from(computed);
      this.#operation = { port: "fixed", size: op.size, address };
    } else {
      this.#operation = { port: "variable", size: op.size };
    }
  }
}
