import type { MemoryAddress } from "@vonsim/common/address";
import { Byte, ByteSize } from "@vonsim/common/byte";
import { forEachWithErrors } from "@vonsim/common/loops";

import { CompilerError } from "@/error";
import type { GlobalStore } from "@/global-store";
import type { DataDirectiveStatement } from "@/parser/statement";
import { Position } from "@/position";
import type { DataDirectiveName } from "@/types";

import { DataValue, Unassigned } from "./value";

/**
 * A data directive.
 *
 * ```vonsim
 * numbers DB 1, 2, 3, ?
 * ```
 *
 * Data directives are used to reserve space in memory and initialize it with values.
 *
 * There are two types of data directives:
 * - DB: reserves space for bytes
 * - DW: reserves space for words
 *
 * DB accepts numbers (signed or unsigned), strings and unassigned bytes.
 * DW accepts numbers (signed or unsigned) and unassigned bytes.
 * Unassigned bytes are used to reserve space without initializing it.
 *
 * Also, they can have labels, which can be used to reference them. These labels
 * can be can be used anywhere in the program.
 *
 * Apart from the unassigned bytes, all other values are evaluated at compile time.
 *
 * When a data directive is created, generic NumberExpressions are assigned as its initial values.
 *
 * Since these expressions can reference other labels or constants, we need to wait until all
 * labels and constants have been created and mapped to their labels (@see {@link GlobalStore}).
 * Then, we can start evaluating and get the actual values.
 *
 * ---
 * This class is: MUTABLE
 */
export class DataDirective {
  #start: MemoryAddress | null = null;
  #values: (Byte | Unassigned)[] | null = null;

  constructor(
    readonly label: string | null,
    protected readonly initialValues: DataValue[],
    readonly size: ByteSize,
    readonly position: Position,
  ) {}

  /**
   * Returns the data directive.
   */
  get directive(): DataDirectiveName {
    return this.size === 8 ? "DB" : "DW";
  }

  /**
   * Returns the length of the data directive in bytes.
   */
  get length(): number {
    return this.initialValues.length * (this.size / 8);
  }

  /**
   * Returns the start address of the data directive.
   */
  get start(): MemoryAddress {
    if (this.#start === null) {
      throw new Error("Start not set");
    }

    return this.#start;
  }

  /**
   * Sets the start address of the data directive.
   * Only allowed to be set once.
   */
  setStart(start: MemoryAddress) {
    if (this.#start !== null) {
      throw new Error("Start already set");
    }

    this.#start = start;
  }

  /**
   * Evaluates the expressions in the data directive, giving numberic values.
   */
  evaluateExpressions(store: GlobalStore): CompilerError<any>[] {
    this.#values = [];

    const errors = forEachWithErrors(
      this.initialValues,
      value => {
        const evaluated = value.evaluate(store);
        this.#values!.push(evaluated);
      },
      CompilerError.from,
    );

    if (errors.length > 0) this.#values = null;
    return errors;
  }

  /**
   * Creates a data directive from a statement.
   */
  static fromStatement(statement: DataDirectiveStatement): DataDirective {
    const values: DataValue[] = [];
    const size: ByteSize = statement.directive === "DB" ? 8 : 16;

    for (const value of statement.values) {
      if (value.isUnassigned()) {
        values.push(DataValue.unassigned(value.position, size));
      } else if (value.isString()) {
        const str = value.str;
        for (let i = 0; i < str.length; i++) {
          const pos = new Position(value.position.start + i, value.position.start + i + 1);
          values.push(DataValue.char(str[i], size, pos));
        }
      } else {
        values.push(DataValue.value(value.value, size));
      }
    }

    if (values.length === 0) {
      throw new CompilerError("must-have-one-or-more-values", statement.directive).at(statement);
    }

    return new DataDirective(statement.label, values, size, statement.position);
  }
}
