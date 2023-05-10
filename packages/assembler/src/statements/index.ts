import type { Position } from "@/position";

import type { DataDirectiveStatementType } from "./data-directive";
import type { EndStatement } from "./end";
import type { InstructionStatementType } from "./instructions";
import type { OriginChangeStatement } from "./origin-change";

/**
 * A statement in the assembly source code.
 *
 * It can be:
 * - An origin change (`ORG`)
 * - An end (`END`)
 * - A data directive (`DB`, `DW`, `EQU`)
 * - An instruction
 *
 * ---
 * This class is: IMMUTABLE
 */
export abstract class Statement {
  abstract readonly type: "origin-change" | "end" | "data-directive" | "instruction";

  constructor(readonly position: Position) {}

  isOriginChange(): this is OriginChangeStatement {
    return this.type === "origin-change";
  }

  isEnd(): this is EndStatement {
    return this.type === "end";
  }

  isDataDirective(): this is DataDirectiveStatementType {
    return this.type === "data-directive";
  }

  isInstruction(): this is InstructionStatementType {
    return this.type === "instruction";
  }

  toJSON() {
    return {
      type: this.type,
      position: this.position.toJSON(),
    };
  }
}

export type StatementType =
  | OriginChangeStatement
  | EndStatement
  | DataDirectiveStatementType
  | InstructionStatementType;

export { DataDirectiveStatement, type DataDirectiveStatementType } from "./data-directive";
export { EndStatement } from "./end";
export { InstructionStatement, type InstructionStatementType } from "./instructions";
export { OriginChangeStatement } from "./origin-change";
