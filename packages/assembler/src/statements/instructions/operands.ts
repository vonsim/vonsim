import type { ByteSize } from "@vonsim/common/byte";
import type { Position } from "@vonsim/common/position";

import { AssemblerError } from "../../error";
import type { GlobalStore } from "../../global-store";
import type { Token } from "../../lexer/tokens";
import type { NumberExpression } from "../../number-expression";
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

  constructor(size: "BYTE" | "WORD" | undefined, position: Position) {
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
   * If the label points to a DB or DW directive without an offset,
   * this method returns the size of the data directive.
   * Otherwise, it returns false.
   */
  isDataDirectiveLabel(store: GlobalStore): ByteSize | false {
    if (!this.value.isLabel()) return false;
    const label = this.value;

    if (label.offset) return false;

    if (!store.labelExists(label.value)) {
      throw new AssemblerError("label-not-found", label.value).at(this.position);
    }

    const type = store.getLabelType(label.value)!;
    return type === "DB" ? 8 : type === "DW" ? 16 : false;
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
