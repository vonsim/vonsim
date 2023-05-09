import type { NumberExpression } from "@/number-expression";
import type { Position } from "@/position";

/**
 * An argument of a data directive.
 *
 * It can be:
 * - A string
 * - An unassigned value (just reserves space)
 * - A number expression (literal value, defined at compile time)
 *
 * ---
 * This class is: IMMUTABLE
 */
abstract class DataDirectiveValue {
  abstract readonly type: "string" | "unassigned" | "numberExpression";

  constructor(readonly position: Position) {}

  isString(): this is StringDirectiveValue {
    return this.type === "string";
  }

  isUnassigned(): this is UnassignedDirectiveValue {
    return this.type === "unassigned";
  }

  isNumberExpression(): this is NumberExpressionDirectiveValue {
    return this.type === "numberExpression";
  }
}

export class StringDirectiveValue extends DataDirectiveValue {
  readonly type = "string";

  constructor(readonly str: string, position: Position) {
    super(position);
  }
}

export class UnassignedDirectiveValue extends DataDirectiveValue {
  readonly type = "unassigned";

  constructor(position: Position) {
    super(position);
  }
}

export class NumberExpressionDirectiveValue extends DataDirectiveValue {
  readonly type = "numberExpression";

  constructor(readonly value: NumberExpression) {
    super(value.position);
  }
}

type DataDirectiveValueType =
  | StringDirectiveValue
  | UnassignedDirectiveValue
  | NumberExpressionDirectiveValue;

export type { DataDirectiveValueType as DataDirectiveValue };
