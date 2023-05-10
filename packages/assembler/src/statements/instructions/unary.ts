import { MemoryAddress } from "@vonsim/common/address";
import type { ByteSize } from "@vonsim/common/byte";

import { CompilerError } from "@/error";
import type { GlobalStore } from "@/global-store";
import { NumberExpression } from "@/number-expression";
import type { Position } from "@/position";
import type { Register } from "@/types";

import { InstructionStatement } from ".";
import type { Operand } from "./operands";

type UnaryInstructionName = "NEG" | "INC" | "DEC" | "NOT";

type InitialOperation =
  | { mode: "reg"; out: Register }
  | { mode: "mem-direct"; size: ByteSize; address: NumberExpression }
  | { mode: "mem-indirect"; size: ByteSize };

type Operation =
  | { mode: "reg"; out: Register }
  | { mode: "mem-direct"; size: ByteSize; address: MemoryAddress }
  | { mode: "mem-indirect"; size: ByteSize };

/**
 * UnaryInstruction:
 * NEG, INC, DEC, NOT
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
   * @see /docs/especificaciones/codificacion.md
   */
  get length(): number {
    if (!this.#initialOperation) throw new Error("Instruction not validated");
    const { mode } = this.#initialOperation;

    switch (mode) {
      case "reg": {
        if (this.instruction === "NEG" || this.instruction === "NOT") return 2;
        else return 1;
      }

      case "mem-direct": {
        return 4;
      }

      case "mem-indirect": {
        return 2;
      }
    }
  }

  get operation(): Operation {
    if (!this.#operation) throw new Error("Instruction not evaluated");

    return this.#operation;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      ...(this.#operation || {}),
    };
  }

  validate(store: GlobalStore) {
    if (this.#initialOperation) throw new Error("Instruction already validated");

    if (this.operands.length !== 1) {
      throw new CompilerError("expects-one-operand").at(this);
    }

    const out = this.operands[0];

    if (out.isRegister()) {
      this.#initialOperation = { mode: "reg", out: out.value };
      return;
    }

    if (out.isDirectAddress()) {
      if (out.size === "auto") {
        throw new CompilerError("unknown-size").at(out);
      }

      this.#initialOperation = { mode: "mem-direct", size: out.size, address: out.value };
      return;
    }

    if (out.isIndirectAddress()) {
      if (out.size === "auto") {
        throw new CompilerError("unknown-size").at(out);
      }

      this.#initialOperation = { mode: "mem-indirect", size: out.size };
      return;
    }

    // out is NumberExpression

    if (out.value.isLabel()) {
      // ^ This check is primarily for type-safety

      const size = out.isDataDirectiveLabel(store);
      if (size) {
        // Is a data label, like `inc dataLabel`

        this.#initialOperation = {
          mode: "mem-direct",
          size,
          // Since doing `inc dataLabel` is equivalent to `inc [OFFSET dataLabel]`,
          // we'll transform the data label into an offset expression
          address: NumberExpression.label(out.value.value, true, out.value.position),
        };
        return;
      }
    }

    throw new CompilerError("destination-cannot-be-immediate").at(out);
  }

  evaluateExpressions(store: GlobalStore): void {
    if (!this.#initialOperation) throw new Error("Instruction not validated");
    if (this.#operation) throw new Error("Instruction aready evaluated");

    const op = this.#initialOperation;

    switch (op.mode) {
      case "reg": {
        this.#operation = { mode: "reg", out: op.out };
        return;
      }

      case "mem-direct": {
        const computed = op.address.evaluate(store);
        if (!MemoryAddress.inRange(computed)) {
          throw new CompilerError("address-out-of-range", computed).at(op.address);
        }

        const address = MemoryAddress.from(computed);
        if (store.addressIsReserved(address)) {
          throw new CompilerError("address-has-code", address).at(op.address);
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
