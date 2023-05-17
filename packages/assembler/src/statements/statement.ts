import type { Position } from "../position";
import type { DataDirectiveStatement } from "./data-directive";
import type { EndStatement } from "./end";
import type { InstructionStatement } from "./instructions";
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

  isDataDirective(): this is DataDirectiveStatement {
    return this.type === "data-directive";
  }

  isInstruction(): this is InstructionStatement {
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
  | DataDirectiveStatement
  | InstructionStatement;
