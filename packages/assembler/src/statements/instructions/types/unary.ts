import { MemoryAddress } from "@vonsim/common/address";
import type { ByteSize } from "@vonsim/common/byte";
import type { Position } from "@vonsim/common/position";

import { AssemblerError } from "../../../error";
import type { GlobalStore } from "../../../global-store";
import { NumberExpression } from "../../../number-expression";
import type { ByteRegister, Register, WordRegister } from "../../../types";
import { registerToBits } from "../encoding";
import type { Operand } from "../operands";
import { InstructionStatement } from "../statement";

type UnaryInstructionName = "NEG" | "INC" | "DEC" | "NOT";

type InitialOperation =
  | { mode: "reg"; size: ByteSize; reg: Register }
  | { mode: "mem-direct"; size: ByteSize; address: NumberExpression }
  | { mode: "mem-indirect"; size: ByteSize };

type Operation =
  | { mode: "reg"; size: 8; reg: ByteRegister }
  | { mode: "reg"; size: 16; reg: WordRegister }
  | { mode: "mem-direct"; size: ByteSize; address: MemoryAddress }
  | { mode: "mem-indirect"; size: ByteSize };

/**
 * UnaryInstruction:
 * - {@link https://vonsim.github.io/docs/cpu/instructions/neg/ | NEG}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/inc/ | INC}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/dec/ | DEC}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/not/ | NOT}
 *
 * These instructions need one operand from {@link InstructionStatement}:
 * - `out`: the destination operand
 *
 * The operand can be:
 * - a register (reg)
 * - a memory address (mem-direct)
 * - an indirect memory address (mem-indirect)
 *
 * The operand cannot be an immediate value.
 *
 * ---
 * This class is: MUTABLE
 */
export class UnaryInstruction extends InstructionStatement {
  #initialOperation: InitialOperation | null = null;
  #operation: Operation | null = null;

  constructor(
    readonly instruction: UnaryInstructionName,
    operands: Operand[],
    label: string | null,
    position: Position,
  ) {
    super(operands, label, position);
  }

  /**
   * Returns the length of the instruction in bytes.
   * @see https://vonsim.github.io/docs/reference/codification/
   */
  get length(): number {
    if (!this.#initialOperation) throw new Error("Instruction not validated");
    const { mode } = this.#initialOperation;

    // opcode + mode
    let length = 2;
    if (mode === "mem-direct") {
      length += 2; // 2-byte address
    }

    return length;
  }

  /**
   * Returns the bytes of the instruction.
   * @see https://vonsim.github.io/docs/reference/codification/
   */
  toBytes(): Uint8Array {
    const bytes: number[] = [];

    const opcodes: { [key in UnaryInstructionName]: number } = {
      NOT: 0b0100_000_0,
      NEG: 0b0100_001_0,
      INC: 0b0100_010_0,
      DEC: 0b0100_011_0,
    };
    bytes[0] = opcodes[this.instruction];

    if (this.operation.size === 16) bytes[0] |= 1;

    switch (this.operation.mode) {
      case "reg": {
        bytes[1] = 0b00000_000; // 00000rrr
        bytes[1] |= registerToBits(this.operation.reg);
        break;
      }

      case "mem-direct": {
        bytes[1] = 0b11000000;
        const address = this.operation.address.byte;
        bytes.push(address.low.unsigned);
        bytes.push(address.high.unsigned);
        break;
      }

      case "mem-indirect": {
        bytes[1] = 0b11010000;
        break;
      }

      default: {
        const _exhaustiveCheck: never = this.operation;
        return _exhaustiveCheck;
      }
    }
    return new Uint8Array(bytes);
  }

  get operation(): Operation {
    if (!this.#operation) throw new Error("Instruction not evaluated");

    return this.#operation;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      ...(this.#operation ??
        this.#initialOperation ?? { operands: this.operands.map(o => o.toJSON()) }),
    };
  }

  validate(store: GlobalStore) {
    if (this.#initialOperation) throw new Error("Instruction already validated");

    if (this.operands.length !== 1) {
      throw new AssemblerError("expects-one-operand").at(this);
    }

    const out = this.operands[0];

    if (out.isRegister()) {
      this.#initialOperation = { mode: "reg", size: out.size, reg: out.value };
      return;
    }

    if (out.isDirectAddress()) {
      if (out.size === "auto") {
        throw new AssemblerError("unknown-size").at(out);
      }

      this.#initialOperation = { mode: "mem-direct", size: out.size, address: out.value };
      return;
    }

    if (out.isIndirectAddress()) {
      if (out.size === "auto") {
        throw new AssemblerError("unknown-size").at(out);
      }

      this.#initialOperation = { mode: "mem-indirect", size: out.size };
      return;
    }

    // out is NumberExpression

    const directAddress = out.getAsDirectAddress(store);
    if (directAddress) {
      // Is a direct address to a data directive pointed by a label,
      // like `inc dataLabel` or `inc dataLabel + 1`

      this.#initialOperation = {
        mode: "mem-direct",
        size: directAddress.size,
        // Since doing `inc dataLabel` is equivalent to `inc [OFFSET dataLabel]`,
        // we'll set the address to the returned expression
        address: directAddress.expression,
      };
      return;
    }

    throw new AssemblerError("destination-cannot-be-immediate").at(out);
  }

  evaluateExpressions(store: GlobalStore): void {
    if (!this.#initialOperation) throw new Error("Instruction not validated");
    if (this.#operation) throw new Error("Instruction aready evaluated");

    const op = this.#initialOperation;

    switch (op.mode) {
      case "reg": {
        this.#operation = { mode: "reg", size: op.size, reg: op.reg } as Operation;
        return;
      }

      case "mem-direct": {
        const computed = op.address.evaluate(store);
        if (!MemoryAddress.inRange(computed)) {
          throw new AssemblerError("address-out-of-range", computed).at(op.address);
        }

        const address = MemoryAddress.from(computed);
        if (store.addressIsReserved(address)) {
          throw new AssemblerError("address-has-code", address).at(op.address);
        }

        this.#operation = { mode: "mem-direct", size: op.size, address };
        return;
      }

      case "mem-indirect": {
        this.#operation = { mode: "mem-indirect", size: op.size };
        return;
      }

      default: {
        const _exhaustiveCheck: never = op;
        return _exhaustiveCheck;
      }
    }
  }
}
