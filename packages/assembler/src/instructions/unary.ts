import { MemoryAddress } from "@vonsim/common/address";
import type { ByteSize } from "@vonsim/common/byte";
import type { TupleToUnion } from "type-fest";

import { CompilerError } from "@/error";
import type { GlobalStore } from "@/global-store";
import { NumberExpression } from "@/number-expression";
import type { InstructionStatement } from "@/parser/statement";
import type { Position } from "@/position";
import type { RegisterName } from "@/types";

import { Instruction } from ".";

type UnaryInstructionName = TupleToUnion<typeof UnaryInstruction.INSTRUCTIONS>;
type UnaryInstructionStatement = InstructionStatement & { instruction: UnaryInstructionName };

type InitialOperation =
  | { mode: "reg"; out: RegisterName }
  | { mode: "mem-direct"; size: ByteSize; address: NumberExpression }
  | { mode: "mem-indirect"; size: ByteSize };

type Operation =
  | { mode: "reg"; out: RegisterName }
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
export class UnaryInstruction extends Instruction {
  static readonly INSTRUCTIONS = ["NEG", "INC", "DEC", "NOT"] as const;

  readonly name: UnaryInstructionName;
  #initialOperation: InitialOperation;
  #operation: Operation | null = null;

  private constructor(attrs: {
    name: UnaryInstructionName;
    label: string | null;
    position: Position;
    operation: InitialOperation;
  }) {
    super(attrs.name, attrs.label, structuredClone(attrs.position));
    this.name = attrs.name;
    this.#initialOperation = structuredClone(attrs.operation);
  }

  /**
   * Returns the length of the instruction in bytes.
   * @see /docs/especificaciones/codificacion.md
   */
  get length(): number {
    const { mode } = this.#initialOperation;

    switch (mode) {
      case "reg": {
        if (this.name === "NEG" || this.name === "NOT") return 2;
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
    if (this.#operation === null) {
      throw new Error("Operation not set");
    }

    return this.#operation;
  }

  evaluateExpressions(store: GlobalStore): void {
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

  static isUnary(statement: InstructionStatement): statement is UnaryInstructionStatement {
    return UnaryInstruction.INSTRUCTIONS.includes(statement.instruction);
  }

  static fromStatement(statement: UnaryInstructionStatement, store: GlobalStore): UnaryInstruction {
    if (statement.operands.length !== 1) {
      throw new CompilerError("expects-one-operand").at(statement);
    }

    const attrs = {
      name: statement.instruction,
      label: statement.label,
      position: statement.position,
    } as const;

    const out = statement.operands[0];

    if (out.isRegister()) {
      return new UnaryInstruction({
        ...attrs,
        operation: { mode: "reg", out: out.value },
      });
    }

    if (out.isDirectAddress()) {
      if (out.size === "auto") {
        throw new CompilerError("unknown-size").at(out);
      }

      return new UnaryInstruction({
        ...attrs,
        operation: { mode: "mem-direct", size: out.size, address: out.value },
      });
    }

    if (out.isIndirectAddress()) {
      if (out.size === "auto") {
        throw new CompilerError("unknown-size").at(out);
      }

      return new UnaryInstruction({
        ...attrs,
        operation: { mode: "mem-indirect", size: out.size },
      });
    }

    // out is NumberExpression

    if (out.value.isLabel()) {
      // ^ This check is primarily for type-safety

      const size = out.isDataDirectiveLabel(store);
      if (size) {
        // Is a data label, like `inc dataLabel`

        return new UnaryInstruction({
          ...attrs,
          operation: {
            mode: "mem-direct",
            size,
            // Since doing `inc dataLabel` is equivalent to `inc [OFFSET dataLabel]`,
            // we'll transform the data label into an offset expression
            address: NumberExpression.label(out.value.value, true, out.value.position),
          },
        });
      }
    }

    throw new CompilerError("destination-cannot-be-immediate").at(out);
  }
}
