import type { MemoryAddress } from "@vonsim/common/address";

import type { GlobalStore } from "@/global-store";
import type { InstructionStatement } from "@/parser/statement";
import type { Position } from "@/position";

import { BinaryInstruction } from "./binary";
import { IntInstruction } from "./int";
import { IOInstruction } from "./io";
import { JumpInstruction } from "./jump";
import { StackInstruction } from "./stack";
import { UnaryInstruction } from "./unary";
import { ZeroaryInstruction } from "./zeroary";

/**
 * An instruction.
 *
 * ```vonsim
 * label: MOV [bx], mem
 * ```
 *
 * Instructions are the most basic building blocks of a program.
 *
 * There are lots of different instructions, but they share some common properties.
 * So, they have been grouped in classes that extend this one:
 * - {@link ZeroaryInstruction}
 * - {@link BinaryInstruction}
 * - {@link UnaryInstruction}
 * - {@link StackInstruction}
 * - {@link JumpInstruction}
 * - {@link IOInstruction}
 * - {@link IntInstruction}
 *
 * Some of them can accept operands. These operands can point to labels.
 * Because of this, we need to wait until all labels addresses and constants have been
 * computed by the {@link GlobalStore} to get the actual operand values.
 *
 * Before that, we can only get generic {@link NumberExpression}s.
 *
 * Nonetheless, we can still compute the length of the instruction with only
 * the types of the labels. This is important because instructions can vary in length
 * depending on the types of the labels.
 *
 * For instance,
 *
 * ```vonsim
 * mov al, label
 * ```
 *
 * If `label` is a constant, the instruction is a MOV reg<-imd (3 bytes).
 * However, if `label` points to a DB, the instruction is a MOV reg<-mem (direct) (4 bytes).
 *
 * With that in mind, the flow of "compiling" an instruction is:
 * - Create the instruction with operands, getting generic {@link NumberExpression}s.
 * - {@link GlobalStore} uses `Instruction#length` to compute the address of the instruction.
 * - With these addresses, {@link GlobalStore} can compute the addresses of the labels.
 * - We use `Instruction#evaluateExpressions` to get the actual operand values.
 *
 * ---
 * This class is: MUTABLE
 */
export abstract class Instruction {
  #start: MemoryAddress | null = null;

  constructor(readonly name: string, readonly label: string | null, readonly position: Position) {}

  abstract get length(): number;
  abstract evaluateExpressions(store: GlobalStore): void;

  static fromStatement(statement: InstructionStatement, store: GlobalStore): Instruction {
    if (ZeroaryInstruction.isZeroary(statement)) {
      return ZeroaryInstruction.fromStatement(statement);
    } else if (BinaryInstruction.isBinary(statement)) {
      return BinaryInstruction.fromStatement(statement, store);
    } else if (UnaryInstruction.isUnary(statement)) {
      return UnaryInstruction.fromStatement(statement, store);
    } else if (StackInstruction.isStack(statement)) {
      return StackInstruction.fromStatement(statement);
    } else if (JumpInstruction.isJump(statement)) {
      return JumpInstruction.fromStatement(statement, store);
    } else if (IOInstruction.isIO(statement)) {
      return IOInstruction.fromStatement(statement);
    } else if (IntInstruction.isInt(statement)) {
      return IntInstruction.fromStatement(statement);
    }

    throw new Error(`Unknown instruction: ${statement.instruction}`);
  }

  get start(): MemoryAddress {
    if (this.#start === null) {
      throw new Error("Start not set");
    }

    return this.#start;
  }

  setStart(start: MemoryAddress) {
    if (this.#start !== null) {
      throw new Error("Start already set");
    }

    this.#start = start;
  }
}

export * from "./binary";
