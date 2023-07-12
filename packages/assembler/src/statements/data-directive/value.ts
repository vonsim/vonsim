import type { Position } from "@vonsim/common/position";

import type { NumberExpression } from "../../number-expression";

/**
 * An argument of a data directive.
 *
 * It can be:
 * - A string
 * - An unassigned value (just reserves space)
 * - A number expression (literal value, defined at assemble time)
 *
 * ---
 * This class is: IMMUTABLE
 */
abstract class DataDirectiveValue {
  abstract readonly type: "string" | "unassigned" | "number-expression";

  constructor(readonly position: Position) {}

  isString(): this is StringDirectiveValue {
    return this.type === "string";
  }

  isUnassigned(): this is UnassignedDirectiveValue {
    return this.type === "unassigned";
  }

  isNumberExpression(): this is NumberExpressionDirectiveValue {
    return this.type === "number-expression";
  }

  toJSON() {
    return {
      type: this.type,
      position: this.position.toJSON(),
    };
  }
}

export class StringDirectiveValue extends DataDirectiveValue {
  readonly type = "string";

  constructor(readonly value: string, position: Position) {
    super(position);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      value: this.value,
    };
  }
}

export class UnassignedDirectiveValue extends DataDirectiveValue {
  readonly type = "unassigned";

  constructor(position: Position) {
    super(position);
  }
}

export class NumberExpressionDirectiveValue extends DataDirectiveValue {
  readonly type = "number-expression";

  constructor(readonly value: NumberExpression) {
    super(value.position);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      value: this.value.toJSON(),
    };
  }
}

type DataDirectiveValueType =
  | StringDirectiveValue
  | UnassignedDirectiveValue
  | NumberExpressionDirectiveValue;

export type { DataDirectiveValueType as DataDirectiveValue };
