import type { Position } from "@vonsim/common/position";

import { AssemblerError } from "./error";
import type { GlobalStore } from "./global-store";

/**
 * A number expression is a recursive data structure that represents a number
 * that can be computed at assemble time.
 *
 * It can be:
 * - A number literal
 * - A label
 * - A unary operation
 * - A binary operation
 *
 * ```vonsim
 * 1 + 2 * 3
 * OFFSET label + 2
 * -3
 * 2 * (3 + 4)
 * OFFSET label + (constant + 2) * 3
 * ```
 *
 * It needs the {@link GlobalStore} to evaluate labels, so it's not possible to
 * evaluate until the store has computed all the labels addresses.
 *
 * ---
 * This class is: IMMUTABLE
 */
export abstract class NumberExpression {
  abstract readonly type: "number-literal" | "label" | "unary-operation" | "binary-operation";

  constructor(readonly position: Position) {}

  abstract evaluate(store: GlobalStore): number;

  isNumberLiteral(): this is NumberLiteral {
    return this.type === "number-literal";
  }

  isLabel(): this is Label {
    return this.type === "label";
  }

  isUnaryOperation(): this is UnaryOperation {
    return this.type === "unary-operation";
  }

  isBinaryOperation(): this is BinaryOperation {
    return this.type === "binary-operation";
  }

  toJSON() {
    return {
      type: this.type,
      position: this.position.toJSON(),
    };
  }

  // Convenience methods for creating number expressions

  static readonly numberLiteral = (...params: ConstructorParameters<typeof NumberLiteral>) =>
    new NumberLiteral(...params);

  static readonly label = (...params: ConstructorParameters<typeof Label>) => new Label(...params);

  static readonly unaryOperation = (...params: ConstructorParameters<typeof UnaryOperation>) =>
    new UnaryOperation(...params);

  static readonly binaryOperation = (...params: ConstructorParameters<typeof BinaryOperation>) =>
    new BinaryOperation(...params);
}

class NumberLiteral extends NumberExpression {
  readonly type = "number-literal";

  constructor(
    readonly value: number,
    position: Position,
  ) {
    super(position);
  }

  evaluate(): number {
    return this.value;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      value: this.value,
    };
  }
}

class Label extends NumberExpression {
  readonly type = "label";

  constructor(
    readonly value: string,
    readonly offset: boolean,
    position: Position,
  ) {
    super(position);
  }

  evaluate(store: GlobalStore): number {
    if (!store.labelExists(this.value)) {
      throw new AssemblerError("label-not-found", this.value).at(this.position);
    }

    const type = store.getLabelType(this.value)!;

    if ((type === "DB" || type === "DW") && !this.offset) {
      throw new AssemblerError("label-should-be-a-number", this.value).at(this.position);
    }

    if ((type === "EQU" || type === "instruction") && this.offset) {
      throw new AssemblerError("offset-only-with-data-directive").at(this.position);
    }

    return store.getLabelValue(this.value)!;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      value: this.value,
      offset: this.offset,
    };
  }
}

class UnaryOperation extends NumberExpression {
  readonly type = "unary-operation";

  constructor(
    readonly operator: "+" | "-",
    readonly right: NumberExpression,
    position: Position,
  ) {
    super(position);
  }

  evaluate(store: GlobalStore): number {
    return this.operator === "+" ? this.right.evaluate(store) : -this.right.evaluate(store);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      operator: this.operator,
      right: this.right.toJSON(),
    };
  }
}

class BinaryOperation extends NumberExpression {
  readonly type = "binary-operation";

  constructor(
    readonly left: NumberExpression,
    readonly operator: "+" | "-" | "*",
    readonly right: NumberExpression,
    position: Position,
  ) {
    super(position);
  }

  evaluate(store: GlobalStore): number {
    return this.operator === "+"
      ? this.left.evaluate(store) + this.right.evaluate(store)
      : this.operator === "-"
        ? this.left.evaluate(store) - this.right.evaluate(store)
        : this.left.evaluate(store) * this.right.evaluate(store);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      operator: this.operator,
      left: this.left.toJSON(),
      right: this.right.toJSON(),
    };
  }
}
