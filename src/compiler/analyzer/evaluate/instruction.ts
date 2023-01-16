import { isMatching, match } from "ts-pattern";

import {
  BinaryInstructionType,
  IntInstructionType,
  IOInstructionType,
  JumpInstructionType,
  LineError,
  PositionRange,
  RegisterType,
  StackInstructionType,
  UnaryInstructionType,
  WordRegisterType,
  ZeroaryInstructionType,
} from "@/compiler/common";
import {
  binaryInstructionPattern,
  interruptPattern,
  intInstructionPattern,
  ioInstructionPattern,
  jumpInstructionPattern,
  stackInstructionPattern,
  unaryInstructionPattern,
  zeroaryInstructionPattern,
} from "@/compiler/common/patterns";
import { NumberExpression } from "@/compiler/parser/grammar";
import { Interrupt, MAX_MEMORY_ADDRESS, MIN_MEMORY_ADDRESS, Size } from "@/config";

import type { LabelMap } from "../compact-labels";
import type { CodeMemory } from "../compute-addresses";
import type { ValidatedInstructionStatement } from "../validate";
import { evaluateExpression, evaluateImmediate } from "./expression";

type InstructionMeta = { start: number; length: number; position: PositionRange };
type RegisterOperand = { type: "register"; register: RegisterType };
type MemoryOperand = { type: "memory" } & (
  | { mode: "direct"; address: number }
  | { mode: "indirect" }
);
type ImmediateOperand = { type: "immediate"; value: number };

export type ProgramInstruction =
  | { type: ZeroaryInstructionType; meta: InstructionMeta }
  | {
      type: BinaryInstructionType;
      meta: InstructionMeta;
      opSize: Size;
      out: RegisterOperand | MemoryOperand;
      src: RegisterOperand | MemoryOperand | ImmediateOperand;
    }
  | {
      type: UnaryInstructionType;
      meta: InstructionMeta;
      opSize: Size;
      out: RegisterOperand | MemoryOperand;
    }
  | { type: StackInstructionType; meta: InstructionMeta; register: WordRegisterType }
  | { type: JumpInstructionType; meta: InstructionMeta; jumpTo: number }
  | {
      type: IOInstructionType;
      meta: InstructionMeta;
      opSize: Size;
      port: { type: "fixed"; value: number } | { type: "variable" };
    }
  | { type: IntInstructionType; meta: InstructionMeta; interrupt: Interrupt };

export function evaluateInstruction(
  statement: ValidatedInstructionStatement,
  labels: LabelMap,
  codeMemory: CodeMemory,
): ProgramInstruction {
  return match<ValidatedInstructionStatement, ProgramInstruction>(statement)
    .with({ type: zeroaryInstructionPattern }, statement => ({
      type: statement.type,
      meta: cleanMeta(statement),
    }))
    .with({ type: binaryInstructionPattern }, statement => ({
      type: statement.type,
      meta: cleanMeta(statement),
      opSize: statement.opSize,
      out:
        statement.out.type === "register" || statement.out.mode === "indirect"
          ? statement.out
          : {
              ...statement.out,
              address: evaluateAddress(statement.out.address, labels, codeMemory),
            },
      src:
        statement.src.type === "immediate"
          ? {
              ...statement.src,
              value: evaluateImmediate(statement.src.value, statement.opSize, labels),
            }
          : statement.src.type === "register" || statement.src.mode === "indirect"
          ? statement.src
          : {
              ...statement.src,
              address: evaluateAddress(statement.src.address, labels, codeMemory),
            },
    }))
    .with({ type: unaryInstructionPattern }, statement => ({
      type: statement.type,
      meta: cleanMeta(statement),
      opSize: statement.opSize,
      out:
        statement.out.type === "register" || statement.out.mode === "indirect"
          ? statement.out
          : {
              ...statement.out,
              address: evaluateAddress(statement.out.address, labels, codeMemory),
            },
    }))
    .with({ type: stackInstructionPattern }, statement => ({
      type: statement.type,
      meta: cleanMeta(statement),
      register: statement.register,
    }))
    .with({ type: jumpInstructionPattern }, statement => {
      const label = labels.get(statement.jumpTo);
      if (!label) {
        throw new LineError("label-not-found", statement.jumpTo, ...statement.meta.position);
      }
      if (label.type !== "instruction") {
        throw new LineError(
          "label-should-be-an-instruction",
          statement.jumpTo,
          ...statement.meta.position,
        );
      }

      return {
        type: statement.type,
        meta: cleanMeta(statement),
        jumpTo: label.address,
      };
    })
    .with({ type: ioInstructionPattern }, statement => ({
      type: statement.type,
      meta: cleanMeta(statement),
      opSize: statement.opSize,
      port:
        statement.port.type === "variable"
          ? { type: "variable" }
          : { type: "fixed", value: evaluateImmediate(statement.port.value, "byte", labels) },
    }))
    .with({ type: intInstructionPattern }, statement => {
      const int = evaluateExpression(statement.interrupt, labels);

      if (!isMatching(interruptPattern, int)) {
        throw new LineError("invalid-interrupt", int, ...statement.interrupt.position);
      }

      return {
        type: statement.type,
        meta: cleanMeta(statement),
        interrupt: int,
      };
    })
    .exhaustive();
}

function cleanMeta(statement: ValidatedInstructionStatement): InstructionMeta {
  return {
    start: statement.meta.start,
    length: statement.meta.length,
    position: statement.meta.position,
  };
}

function evaluateAddress(
  address: NumberExpression,
  labels: LabelMap,
  codeMemory: CodeMemory,
): number {
  const computed = evaluateExpression(address, labels);
  if (computed < MIN_MEMORY_ADDRESS || computed > MAX_MEMORY_ADDRESS) {
    throw new LineError("address-out-of-range", computed, ...address.position);
  }
  if (codeMemory.has(computed)) {
    throw new LineError("address-has-code", computed, ...address.position);
  }
  return computed;
}
