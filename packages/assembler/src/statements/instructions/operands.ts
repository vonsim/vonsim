import type { ByteSize } from "@vonsim/common/byte";
import type { Position } from "@vonsim/common/position";

import { AssemblerError } from "../../error";
import type { GlobalStore } from "../../global-store";
import type { Token } from "../../lexer/tokens";
import { NumberExpression } from "../../number-expression";
import { Register, WORD_REGISTERS } from "../../types";

/**
 * An operand of an instruction.
 *
 * It can be:
 * - A register
 * - An indirect address
 * - A direct address
 * - A number expression, which can be:
 *  - An immediate value
 *  - A label pointing to a memory address (direct memory addressing)
 *
 * ---
 * This class is: IMMUTABLE
 */
abstract class Operand {
  abstract type: "register" | "indirect-address" | "direct-address" | "number-expression";

  constructor(readonly position: Position) {}

  isRegister(): this is RegisterOperand {
    return this.type === "register";
  }

  isIndirectAddress(): this is IndirectAddressOperand {
    return this.type === "indirect-address";
  }

  isDirectAddress(): this is DirectAddressOperand {
    return this.type === "direct-address";
  }

  isNumberExpression(): this is NumberExpressionOperand {
    return this.type === "number-expression";
  }

  toJSON() {
    return {
      type: this.type,
      position: this.position.toJSON(),
    };
  }
}

export class RegisterOperand extends Operand {
  readonly type = "register";
  readonly value: Register;

  constructor(token: Token & { type: Register }) {
    super(token.position);
    this.value = token.type;
  }

  get size(): ByteSize {
    return WORD_REGISTERS.includes(this.value) ? 16 : 8;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      value: this.value,
    };
  }
}

export class IndirectAddressOperand extends Operand {
  readonly type = "indirect-address";
  readonly size: ByteSize | "auto";

  constructor(
    size: "BYTE" | "WORD" | undefined,
    position: Position,
    readonly offset: NumberExpression | null,
  ) {
    super(position);
    if (size) this.size = size === "BYTE" ? 8 : 16;
    else this.size = "auto";
  }

  toJSON() {
    return {
      ...super.toJSON(),
      size: this.size,
    };
  }
}

export class DirectAddressOperand extends Operand {
  readonly type = "direct-address";
  readonly size: ByteSize | "auto";

  constructor(
    readonly value: NumberExpression,
    size: "BYTE" | "WORD" | undefined,
    position: Position,
  ) {
    super(position);
    if (size) this.size = size === "BYTE" ? 8 : 16;
    else this.size = "auto";
  }

  toJSON() {
    return {
      ...super.toJSON(),
      size: this.size,
      value: this.value.toJSON(),
    };
  }
}

export class NumberExpressionOperand extends Operand {
  readonly type = "number-expression";

  constructor(readonly value: NumberExpression) {
    super(value.position);
  }

  /**
   * If the expression is a label (with an optional offset) pointing to a memory address,
   * WITHOUT an offset, this method returns the size of the data directive and a copy
   * of the NumberExpression with the offset set to true.
   * Otherwise, it returns false.
   *
   * Examples:
   * ```vonsim
   * org 1000h
   * letras db "abcd"
   *
   * org 2000h
   * mov al, letras     ; copies "a" to al
   * mov al, letras + 1 ; copies "b" to al
   * mov al, letras + 2 ; copies "c" to al
   * ```
   *
   * for each of the `mov` instructions, this method returns:
   * ```ts
   * { size: 8, value: { type: "label", value: "LETRAS", offset: true } }
   * { size: 8, value: { type: "binary-operation", operator: "+", left: { type: "label", value: "LETRAS", offset: true }, right: { type: "number-literal", value: 1 } } }
   * { size: 8, value: { type: "binary-operation", operator: "+", left: { type: "label", value: "LETRAS", offset: true }, right: { type: "number-literal", value: 2 } } }
   * ```
   */
  getAsDirectAddress(store: GlobalStore) {
    return NumberExpressionOperand.recursiveGetAsDirectAddress(this.value, store);
  }

  /**
   * Recursively checks if the expression is a direct address. See {@link NumberExpressionOperand.getAsDirectAddress}.
   */
  private static recursiveGetAsDirectAddress(
    expression: NumberExpression,
    store: GlobalStore,
  ): { size: ByteSize; expression: NumberExpression } | false {
    if (expression.isLabel()) {
      const label = expression;

      if (label.offset) return false;

      if (!store.labelExists(label.value)) {
        throw new AssemblerError("label-not-found", label.value).at(expression.position);
      }

      const type = store.getLabelType(label.value)!;
      const size = type === "DB" ? 8 : type === "DW" ? 16 : false;
      if (!size) return false;
      return { size, expression: NumberExpression.label(label.value, true, expression.position) };
    } else if (expression.isBinaryOperation()) {
      // Just allow the label to be on the left side of the binary operation
      // and to be added to a number literal
      // Notice that this if also checks for the case (label + 2) * 3, because
      // the multiplication will be evaluated first (because it appears before on
      // the expression tree).
      if (expression.operator !== "+" && expression.operator !== "-") return false;

      // Look for the leftmost label
      const left = NumberExpressionOperand.recursiveGetAsDirectAddress(expression.left, store);
      if (!left) return false;

      // Found a label on the leftmost side of the expression
      return {
        size: left.size,
        expression: NumberExpression.binaryOperation(
          left.expression,
          expression.operator,
          expression.right,
          expression.position,
        ),
      };
    }

    // Any other type of expression is not a direct address
    // (e.g. (label + 2) * 3)
    // When traversing down the expression tree, the only valid expressions
    // are binary operations and one final label.

    return false;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      value: this.value.toJSON(),
    };
  }
}

type OperandType =
  | RegisterOperand
  | IndirectAddressOperand
  | DirectAddressOperand
  | NumberExpressionOperand;

export type { OperandType as Operand };
