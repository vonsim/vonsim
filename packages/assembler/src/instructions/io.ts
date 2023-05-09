import type { TupleToUnion } from "type-fest";

import { CompilerError } from "@/error";
import type { GlobalStore } from "@/global-store";
import type { NumberExpression } from "@/number-expression";
import type { InstructionStatement } from "@/parser/statement";
import type { Position } from "@/position";
import { IOAddress } from "~common/address";
import type { ByteSize } from "~common/byte";

import { Instruction } from ".";

type IOInstructionName = TupleToUnion<typeof IOInstruction.INSTRUCTIONS>;
type IOInstructionStatement = InstructionStatement & { instruction: IOInstructionName };

type InitialOperation =
  | { port: "fixed"; size: ByteSize; address: NumberExpression }
  | { port: "variable"; size: ByteSize };

type Operation =
  | { port: "fixed"; size: ByteSize; address: IOAddress }
  | { port: "variable"; size: ByteSize };

/**
 * IOInstruction:
 * IN, OUT
 *
 * These instructions need two operands from {@link InstructionStatement}:
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
export class IOInstruction extends Instruction {
  static readonly INSTRUCTIONS = ["IN", "OUT"] as const;

  readonly name: IOInstructionName;
  #initialOperation: InitialOperation;
  #operation: Operation | null = null;

  private constructor(attrs: {
    name: IOInstructionName;
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
    const { port } = this.#initialOperation;

    if (port === "fixed") return 2;
    else return 1;
  }

  get operation(): Operation {
    if (this.#operation === null) {
      throw new Error("Operation not set");
    }

    return this.#operation;
  }

  evaluateExpressions(store: GlobalStore): void {
    const op = this.#initialOperation;

    if (op.port === "fixed") {
      const computed = op.address.evaluate(store);
      if (!IOAddress.inRange(computed)) {
        throw new CompilerError("io-address-out-of-range", computed).at(this);
      }

      const address = IOAddress.from(computed);
      this.#operation = { port: "fixed", size: op.size, address };
    } else {
      this.#operation = { port: "variable", size: op.size };
    }
  }

  static isIO(statement: InstructionStatement): statement is IOInstructionStatement {
    return IOInstruction.INSTRUCTIONS.includes(statement.instruction);
  }

  static fromStatement(statement: IOInstructionStatement): IOInstruction {
    if (statement.operands.length !== 2) {
      throw new CompilerError("expects-two-operands").at(statement);
    }

    const internal = statement.operands[statement.instruction === "IN" ? 0 : 1];
    const external = statement.operands[statement.instruction === "IN" ? 1 : 0];

    if (!internal.isRegister() || (internal.value !== "AL" && internal.value !== "AX")) {
      throw new CompilerError("expects-ax").at(internal);
    }

    const attrs = {
      name: statement.instruction,
      label: statement.label,
      position: statement.position,
    } as const;

    const size: ByteSize = internal.value === "AX" ? 16 : 8;

    if (external.isRegister()) {
      if (external.value !== "DX") {
        throw new CompilerError("expects-dx").at(external);
      }

      return new IOInstruction({
        ...attrs,
        operation: { port: "variable", size },
      });
    }

    if (external.isNumberExpression()) {
      return new IOInstruction({
        ...attrs,
        operation: { port: "fixed", size, address: external.value },
      });
    }

    // external isn't a number expression
    throw new CompilerError("expects-immediate").at(external);
  }
}
