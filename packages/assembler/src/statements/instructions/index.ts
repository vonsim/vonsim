import type { MemoryAddress } from "@vonsim/common/address";

import type { GlobalStore } from "@/global-store";
import { Token } from "@/lexer/tokens";
import { Position } from "@/position";
import { Instruction } from "@/types";

import { Statement } from "..";
import { BinaryInstruction } from "./binary";
import { IntInstruction } from "./int";
import { IOInstruction } from "./io";
import { JumpInstruction } from "./jump";
import type { Operand } from "./operands";
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

  static create(
    token: Token & { type: Instruction },
    operands: Operand[],
    label: string | null,
  ): InstructionStatementType {
    const position = Position.merge(token.position, ...operands.map(op => op.position));

    switch (token.type) {
      case "PUSHF":
      case "POPF":
      case "RET":
      case "IRET":
      case "CLI":
      case "STI":
      case "NOP":
      case "HLT":
        return new ZeroaryInstruction(token.type, operands, label, position);
      case "MOV":
      case "ADD":
      case "ADC":
      case "SUB":
      case "SBB":
      case "CMP":
      case "AND":
      case "OR":
      case "XOR":
        return new BinaryInstruction(token.type, operands, label, position);
      case "NEG":
      case "INC":
      case "DEC":
      case "NOT":
        return new UnaryInstruction(token.type, operands, label, position);
      case "PUSH":
      case "POP":
        return new StackInstruction(token.type, operands, label, position);
      case "CALL":
      case "JZ":
      case "JNZ":
      case "JS":
      case "JNS":
      case "JC":
      case "JNC":
      case "JO":
      case "JNO":
      case "JMP":
        return new JumpInstruction(token.type, operands, label, position);
      case "IN":
      case "OUT":
        return new IOInstruction(token.type, operands, label, position);
      case "INT":
        return new IntInstruction(token.type, operands, label, position);
    }
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

export {
  BinaryInstruction,
  IntInstruction,
  IOInstruction,
  JumpInstruction,
  StackInstruction,
  UnaryInstruction,
  ZeroaryInstruction,
};
