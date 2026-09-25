import { charToDecimal } from "@vonsim/common/ascii";
import { AnyByte, Byte, ByteSize } from "@vonsim/common/byte";
import { forEachWithErrors } from "@vonsim/common/loops";
import { Position } from "@vonsim/common/position";

import { AssemblerError } from "../../../error";
import type { GlobalStore } from "../../../global-store";
import { NumberExpression } from "../../../number-expression";
import type { DataDirective as AllDataDirectives } from "../../../types";
import { DataDirectiveStatement } from "../statement";
import type { DataDirectiveValue } from "../value";

/**
 * A symbol representing an unassigned (`?`) value.
 */
export const unassigned = Symbol("unassigned");
type Unassigned = typeof unassigned;

/**
 * A DUP directive, which is used to repeat a value a certain number of times.
 *
 * ```vonsim
 * DB 5 DUP(1)  ; Creates 5 bytes with the value 1
 * ```
 *
 * A DUP directive can repeat multiple values and can also be nested.
 *
 * ---
 * This class is: IMMUTABLE
 */
class DuplicateExpression {
  constructor(
    readonly count: NumberExpression,
    readonly values: InitialValueType[],
  ) {}

  toJSON(): DuplicateExpressionJSON {
    return {
      count: this.count.toJSON(),
      values: this.values.map(initialValueTypeToJSON),
    };
  }
}
type DuplicateExpressionJSON = {
  count: ReturnType<NumberExpression["toJSON"]>;
  values: InitialValueTypeJSON[];
};

// Extra types and helper functions

type DataDirective = Exclude<AllDataDirectives, "EQU">;
type InitialValueType = Unassigned | DuplicateExpression | NumberExpression;

type InitialValueTypeJSON = "?" | ReturnType<NumberExpression["toJSON"]> | DuplicateExpressionJSON;
const initialValueTypeToJSON = (value: InitialValueType): InitialValueTypeJSON => {
  if (value === unassigned) return "?";
  return value.toJSON();
};

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
 * Both types can also accept a DUP directive, which repeats a value a certain number of times.
 *
 * Also, they can have labels, which can be used to reference them. These labels
 * can be can be used anywhere in the program.
 *
 * Apart from the unassigned bytes, all other values are evaluated at assemble time.
 *
 * When a data directive is created, generic NumberExpressions are assigned as its initial values.
 *
 * Since these expressions can reference other labels or constants, we need to wait until all
 * labels and constants have been created and mapped to their labels (see {@link GlobalStore}).
 * Then, we can start evaluating and get the actual values.
 *
 * ---
 * This class is: MUTABLE
 */
export class Data extends DataDirectiveStatement {
  readonly size: ByteSize;
  #initialValues: InitialValueType[] | null = null;
  #length: number | null = null;
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
    if (this.#length === null) throw new Error("Data directive length not computed");

    return this.#length;
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

  #validateValue(value: DataDirectiveValue): InitialValueType[] {
    if (value.isUnassigned()) {
      return [unassigned];
    } else if (value.isString()) {
      if (this.directive !== "DB") {
        throw new AssemblerError("cannot-accept-strings", this.directive).at(value);
      }

      const str = value.value;
      const values: NumberExpression[] = [];
      for (let i = 0; i < str.length; i++) {
        const decimal = charToDecimal(str[i]);
        if (decimal === null) throw new Error("Invalid character, should not happen");

        const position = new Position(value.position.start + i, value.position.start + i + 1);
        const expr = NumberExpression.numberLiteral(decimal, position);
        values.push(expr);
      }
      return values;
    } else if (value.isDuplicate()) {
      return [
        new DuplicateExpression(
          value.count,
          value.values.flatMap(v => this.#validateValue(v)),
        ),
      ];
    } else {
      return [value.value];
    }
  }

  /**
   * Creates a data directive from a statement.
   */
  validate() {
    if (this.#initialValues) throw new Error("Data directive already validated");

    this.#initialValues = this.values.flatMap(value => this.#validateValue(value));

    if (this.#initialValues.length === 0) {
      throw new AssemblerError("must-have-one-or-more-values", this.directive).at(this);
    }
  }

  /**
   * Evaluates the count of a DUP.
   *
   * This is needed to compute the length of the data directive, which happens before the
   * {@link GlobalStore} has computed the addresses of the labels. The count can only depend
   * on number literals and constants that don't depend on addresses.
   */
  #evaluateCount(store: GlobalStore, duplicate: DuplicateExpression): number {
    let count: number;
    try {
      count = duplicate.count.evaluate(store);
    } catch (error) {
      // Point to the count rather than to the label (which may be inside a constant)
      if (error instanceof AssemblerError && error.code === "dup-count-depends-on-address") {
        error.at(duplicate.count);
      }
      throw error;
    }

    if (count < 0) {
      throw new AssemblerError("dup-count-positive").at(duplicate.count);
    }
    return count;
  }

  /**
   * @returns How many elements (bytes for DB, words for DW) the value takes once expanded.
   */
  #countElements(store: GlobalStore, value: InitialValueType): number {
    if (!(value instanceof DuplicateExpression)) return 1;

    const count = this.#evaluateCount(store, value);
    if (count === 0) return 0;

    let elements = 0;
    for (const v of value.values) elements += this.#countElements(store, v);
    return count * elements;
  }

  /**
   * Computes the length of the data directive. Must be called after all the statements have been
   * validated and before the {@link GlobalStore} computes the addresses.
   */
  computeLength(store: GlobalStore) {
    if (!this.#initialValues) throw new Error("Data directive not validated");
    if (this.#length !== null) throw new Error("Data directive length already computed");

    let elements = 0;
    for (const value of this.#initialValues) elements += this.#countElements(store, value);
    this.#length = elements * (this.size / 8);
  }

  #evaluateExpression(store: GlobalStore, value: InitialValueType): (AnyByte | Unassigned)[] {
    if (value === unassigned) {
      return [unassigned];
    } else if (value instanceof DuplicateExpression) {
      const count = this.#evaluateCount(store, value);
      const bytes = value.values.flatMap(v => this.#evaluateExpression(store, v));
      return Array(count).fill(bytes).flat();
    } else {
      const evaluated = value.evaluate(store);
      if (!Byte.fits(evaluated, this.size)) {
        throw new AssemblerError("value-out-of-range", evaluated, this.size).at(this);
      }
      const byte = Byte.fromNumber(evaluated, this.size) as AnyByte;
      return [byte];
    }
  }

  /**
   * Evaluates the expressions in the data directive, giving numberic values.
   */
  evaluateExpressions(store: GlobalStore): AssemblerError<any>[] {
    if (!this.#initialValues) throw new Error("Data directive not validated");
    if (this.#values) throw new Error("Data directive already evaluated");

    this.#values = [];

    const errors = forEachWithErrors(
      this.#initialValues,
      value => {
        this.#values!.push(...this.#evaluateExpression(store, value));
      },
      AssemblerError.from,
    );

    if (errors.length > 0) this.#values = null;
    return errors;
  }
}
