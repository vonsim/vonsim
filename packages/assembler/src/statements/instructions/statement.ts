import type { MemoryAddress } from "@vonsim/common/address";

import type { GlobalStore } from "../../global-store";
import type { Position } from "../../position";
import type { Instruction } from "../../types";
import { Statement } from "../statement";
import type { Operand } from "./operands";
import type { BinaryInstruction } from "./types/binary";
import type { IntInstruction } from "./types/int";
import type { IOInstruction } from "./types/io";
import type { JumpInstruction } from "./types/jump";
import type { StackInstruction } from "./types/stack";
import type { UnaryInstruction } from "./types/unary";
import type { ZeroaryInstruction } from "./types/zeroary";

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
 * - Create the instruction with operands.
 * - Validate the instruction with `InstructionStatement#validate`, getting generic {@link NumberExpression}s.
 * - {@link GlobalStore} uses `InstructionStatement#length` to compute the address of the instruction.
 * - With these addresses, {@link GlobalStore} can compute the addresses of the labels.
 * - We use `InstructionStatement#evaluateExpressions` to get the actual operand values.
 *
 * ---
 * This class is: MUTABLE
 */
export abstract class InstructionStatement extends Statement {
  readonly type = "instruction";
  readonly label: string | null;
  protected readonly operands: Operand[];
  #start: MemoryAddress | null = null;

  constructor(operands: Operand[], label: string | null, position: Position) {
    super(position);
    this.operands = operands;
    this.label = label;
  }

  abstract readonly instruction: Instruction;
  abstract get length(): number;
  abstract validate(store: GlobalStore): void;
  abstract evaluateExpressions(store: GlobalStore): void;

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

  toJSON() {
    return {
      ...super.toJSON(),
      instruction: this.instruction,
      label: this.label,
    };
  }
}

export type InstructionStatementType =
  | ZeroaryInstruction
  | BinaryInstruction
  | UnaryInstruction
  | StackInstruction
  | JumpInstruction
  | IOInstruction
  | IntInstruction;
