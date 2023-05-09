import type { ByteSize } from "@vonsim/common/byte";

import { CompilerError } from "@/error";
import type { GlobalStore } from "@/global-store";
import type { Token } from "@/lexer/tokens";
import type { NumberExpression } from "@/number-expression";
import type { Position } from "@/position";
import { RegisterName, WORD_REGISTERS } from "@/types";

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
  constructor(readonly position: Position) {}

  isRegister(): this is RegisterOperand {
    return this instanceof RegisterOperand;
  }

  isIndirectAddress(): this is IndirectAddressOperand {
    return this instanceof IndirectAddressOperand;
  }

  isDirectAddress(): this is DirectAddressOperand {
    return this instanceof DirectAddressOperand;
  }

  isNumberExpression(): this is NumberExpressionOperand {
    return this instanceof NumberExpressionOperand;
  }
}

export class RegisterOperand extends Operand {
  readonly value: RegisterName;

  constructor(token: Token & { type: RegisterName }) {
    super(token.position);
    this.value = token.type;
  }

  get size(): ByteSize {
    return WORD_REGISTERS.includes(this.value) ? 16 : 8;
  }
}

export class IndirectAddressOperand extends Operand {
  constructor(readonly size: ByteSize | "auto", position: Position) {
    super(position);
  }
}

export class DirectAddressOperand extends Operand {
  constructor(
    readonly size: ByteSize | "auto",
    readonly value: NumberExpression,
    position: Position,
  ) {
    super(position);
  }
}

export class NumberExpressionOperand extends Operand {
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
      throw new CompilerError("label-not-found", label.value).at(this.position);
    }

    const type = store.getLabelType(label.value)!;
    return type === "DB" ? 8 : type === "DW" ? 16 : false;
  }
}

type OperandType =
  | RegisterOperand
  | IndirectAddressOperand
  | DirectAddressOperand
  | NumberExpressionOperand;

export type { OperandType as Operand };
