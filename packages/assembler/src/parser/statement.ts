import { Constant } from "@/constant";
import { DataDirective } from "@/data-directive";
import { Instruction } from "@/instructions";
import type { Token } from "@/lexer/tokens";
import { Position } from "@/position";
import type { ConstantName, DataDirectiveName, InstructionName } from "@/types";

import type { DataDirectiveValue } from "./directive-value";
import type { Operand } from "./operands";

/**
 * A statement in the assembly source code.
 *
 * It can be:
 * - An origin change (`ORG`)
 * - An end (`END`)
 * - A constant (`EQU`)
 * - A data directive (`DB`, `DW`)
 * - An instruction
 *
 * ---
 * This class is: IMMUTABLE
 */
abstract class Statement {
  abstract readonly type: "origin-change" | "end" | "constant" | "data-directive" | "instruction";

  constructor(readonly position: Position) {}

  isOriginChange(): this is OriginChangeStatement {
    return this.type === "origin-change";
  }

  isEnd(): this is EndStatement {
    return this.type === "end";
  }

  isConstant(): this is ConstantStatement {
    return this.type === "constant";
  }

  isDataDirective(): this is DataDirectiveStatement {
    return this.type === "data-directive";
  }

  isInstruction(): this is InstructionStatement {
    return this.type === "instruction";
  }
}

export class OriginChangeStatement extends Statement {
  readonly type = "origin-change";

  constructor(readonly newAddress: number, position: Position) {
    super(position);
  }
}

export class EndStatement extends Statement {
  readonly type = "end";

  constructor(position: Position) {
    super(position);
  }
}

export class ConstantStatement extends Statement {
  readonly type = "constant";

  constructor(
    token: Token & { type: ConstantName },
    readonly value: DataDirectiveValue,
    readonly label: string,
  ) {
    super(Position.merge(token.position, value.position));
  }

  toConstant(): Constant {
    return Constant.fromStatement(this);
  }
}

export class DataDirectiveStatement extends Statement {
  readonly type = "data-directive";
  readonly directive: DataDirectiveName;

  constructor(
    token: Token & { type: DataDirectiveName },
    readonly values: DataDirectiveValue[],
    readonly label: string | null,
  ) {
    super(Position.merge(token.position, ...values.map(v => v.position)));
    this.directive = token.type;
  }

  toDataDirective(): DataDirective {
    return DataDirective.fromStatement(this);
  }
}

export class InstructionStatement extends Statement {
  readonly type = "instruction";
  readonly instruction: InstructionName;

  constructor(
    token: Token & { type: InstructionName },
    readonly operands: Operand[],
    readonly label: string | null,
  ) {
    super(Position.merge(token.position, ...operands.map(op => op.position)));
    this.instruction = token.type;
  }

  toInstruction(): Instruction {
    // return this.instruction;
  }
}

export type StatementType =
  | OriginChangeStatement
  | EndStatement
  | ConstantStatement
  | DataDirectiveStatement
  | InstructionStatement;

export type { StatementType as Statement };
