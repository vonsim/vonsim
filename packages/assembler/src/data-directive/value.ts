import { charToDecimal } from "@vonsim/common/ascii";
import { Byte, ByteSize } from "@vonsim/common/byte";

import { CompilerError } from "@/error";
import type { GlobalStore } from "@/global-store";
import { NumberExpression } from "@/number-expression";
import { Position } from "@/position";

export type Unassigned = typeof DataValue.UNASSIGNED;

/**
 * Each one of the values in a data directive.
 * More specifically, the initial NumberExpression.
 * It will return a Byte or Unassigned when evaluated with a GlobalStore.
 *
 * ---
 * This class is: IMMUTABLE
 */
export class DataValue {
  static readonly UNASSIGNED = Symbol("unassigned");
  #value: NumberExpression | Unassigned;

  private constructor(
    value: NumberExpression | Unassigned,
    readonly size: ByteSize,
    readonly position: Position,
  ) {
    this.#value = value;
  }

  isUnassigned(): boolean {
    return this.#value === DataValue.UNASSIGNED;
  }

  isValue(): boolean {
    return this.#value !== DataValue.UNASSIGNED;
  }

  evaluate(store: GlobalStore): Byte | Unassigned {
    if (this.#value === DataValue.UNASSIGNED) {
      return DataValue.UNASSIGNED;
    }

    const evaluated = this.#value.evaluate(store);
    if (!Byte.fits(evaluated, this.size)) {
      throw new CompilerError("value-out-of-range", evaluated, this.size).at(this.position);
    }
    return Byte.fromNumber(evaluated, this.size);
  }

  static unassigned(position: Position, size: ByteSize): DataValue {
    return new DataValue(DataValue.UNASSIGNED, size, position);
  }

  static value(value: NumberExpression, size: ByteSize): DataValue {
    return new DataValue(value, size, value.position);
  }

  static char(char: string, size: ByteSize, position: Position): DataValue {
    if (size !== 8) {
      throw new CompilerError("cannot-accept-strings", "DW").at(position);
    }

    const decimal = charToDecimal(char);
    if (decimal === null) throw new Error("Invalid character, should not happen");

    const expr = NumberExpression.numberLiteral(decimal, position);
    return DataValue.value(expr, size);
  }
}
