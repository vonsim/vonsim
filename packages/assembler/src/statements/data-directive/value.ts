import type { Position } from "@vonsim/common/position";

import type { NumberExpression } from "../../number-expression";

type DataDirectiveValueJSON =
  | ReturnType<StringDirectiveValue["toJSON"]>
  | ReturnType<UnassignedDirectiveValue["toJSON"]>
  | ReturnType<NumberExpressionDirectiveValue["toJSON"]>
  | DuplicateDirectiveValueJSON;

/**
 * An argument of a data directive.
 *
 * It can be:
 * - A string
 * - An unassigned value (just reserves space)
 * - A number expression (literal value, defined at assemble time)
 * - A fixed repetition (number-expression) of a value (any data directive value)
 *
 * ---
 * This class is: IMMUTABLE
 */
abstract class DataDirectiveValue {
  abstract readonly type: "string" | "unassigned" | "number-expression" | "duplicate";

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

  isDuplicate(): this is DuplicateDirectiveValue {
    return this.type === "duplicate";
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

  constructor(
    readonly value: string,
    position: Position,
  ) {
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

type DuplicateDirectiveValueJSON = {
  type: DataDirectiveValue["type"];
  position: ReturnType<Position["toJSON"]>;
  count: ReturnType<NumberExpression["toJSON"]>;
  values: DataDirectiveValueJSON[];
};
export class DuplicateDirectiveValue extends DataDirectiveValue {
  readonly type = "duplicate";

  constructor(
    readonly count: NumberExpression,
    readonly values: DataDirectiveValueType[],
    position: Position,
  ) {
    super(position);
  }

  toJSON(): DataDirectiveValueJSON {
    return {
      ...super.toJSON(),
      count: this.count.toJSON(),
      values: this.values.map(value => value.toJSON()),
    };
  }
}

type DataDirectiveValueType =
  | StringDirectiveValue
  | UnassignedDirectiveValue
  | NumberExpressionDirectiveValue
  | DuplicateDirectiveValue;

export type { DataDirectiveValueType as DataDirectiveValue };
