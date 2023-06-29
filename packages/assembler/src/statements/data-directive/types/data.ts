import { charToDecimal } from "@vonsim/common/ascii";
import { AnyByte, Byte, ByteSize } from "@vonsim/common/byte";
import { forEachWithErrors } from "@vonsim/common/loops";

import { CompilerError } from "../../../error";
import type { GlobalStore } from "../../../global-store";
import { NumberExpression } from "../../../number-expression";
import { Position } from "../../../position";
import type { DataDirective as AllDataDirectives } from "../../../types";
import { DataDirectiveStatement } from "../statement";
import type { DataDirectiveValue } from "../value";

export const unassigned = Symbol("unassigned");
type Unassigned = typeof unassigned;
type DataDirective = Exclude<AllDataDirectives, "EQU">;

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
export class Data extends DataDirectiveStatement {
  readonly size: ByteSize;
  #initialValues: (NumberExpression | Unassigned)[] | null = null;
  #values: (AnyByte | Unassigned)[] | null = null;

  constructor(
    readonly directive: DataDirective,
    values: DataDirectiveValue[],
    label: string | null,
    position: Position,
  ) {
    super(values, label, position);
    this.size = directive === "DB" ? 8 : 16;
  }

  /**
   * Returns the length of the data directive in bytes.
   */
  get length(): number {
    if (!this.#initialValues) throw new Error("Data directive not validated");

    return this.#initialValues.length * (this.size / 8);
  }

  getValues(): (AnyByte | Unassigned)[] {
    if (!this.#values) throw new Error("Data directive not evaluated");

    return this.#values;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      values: (this.#values ?? this.#initialValues ?? this.values).map(v =>
        v === unassigned ? "?" : v.toJSON(),
      ),
    };
  }

  /**
   * Creates a data directive from a statement.
   */
  validate() {
    if (this.#initialValues) throw new Error("Data directive already validated");

    this.#initialValues = [];

    for (const value of this.values) {
      if (value.isUnassigned()) {
        this.#initialValues.push(unassigned);
      } else if (value.isString()) {
        if (this.directive !== "DB") {
          throw new CompilerError("cannot-accept-strings", this.directive).at(value);
        }

        const str = value.value;
        for (let i = 0; i < str.length; i++) {
          const decimal = charToDecimal(str[i]);
          if (decimal === null) throw new Error("Invalid character, should not happen");

          const position = new Position(value.position.start + i, value.position.start + i + 1);
          const expr = NumberExpression.numberLiteral(decimal, position);
          this.#initialValues.push(expr);
        }
      } else {
        this.#initialValues.push(value.value);
      }
    }

    if (this.#initialValues.length === 0) {
      throw new CompilerError("must-have-one-or-more-values", this.directive).at(this);
    }
  }

  /**
   * Evaluates the expressions in the data directive, giving numberic values.
   */
  evaluateExpressions(store: GlobalStore): CompilerError<any>[] {
    if (!this.#initialValues) throw new Error("Data directive not validated");
    if (this.#values) throw new Error("Data directive already evaluated");

    this.#values = [];

    const errors = forEachWithErrors(
      this.#initialValues,
      value => {
        if (value === unassigned) {
          this.#values!.push(unassigned);
        } else {
          const evaluated = value.evaluate(store);
          if (!Byte.fits(evaluated, this.size)) {
            throw new CompilerError("value-out-of-range", evaluated, this.size).at(this);
          }
          const byte = Byte.fromNumber(evaluated, this.size) as AnyByte;
          this.#values!.push(byte);
        }
      },
      CompilerError.from,
    );

    if (errors.length > 0) this.#values = null;
    return errors;
  }
}
