import { isMatching, match, P } from "ts-pattern";
import {
  BinaryInstructionType,
  CompilerError,
  hex,
  IntInstructionType,
  IOInstructionType,
  JumpInstructionType,
  PositionRange,
  RegisterType,
  StackInstructionType,
  UnaryInstructionType,
  WordRegisterType,
  ZeroaryInstructionType,
} from "~/compiler/common";
import {
  binaryInstructionPattern,
  intInstructionPattern,
  ioInstructionPattern,
  jumpInstructionPattern,
  stackInstructionPattern,
  unaryInstructionPattern,
  zeroaryInstructionPattern,
} from "~/compiler/common/patterns";
import { NumberExpression } from "~/compiler/parser/grammar";
import {
  INTERRUPTIONS,
  MAX_BYTE_VALUE,
  MAX_MEMORY_ADDRESS,
  MAX_WORD_VALUE,
  MIN_BYTE_VALUE,
  MIN_MEMORY_ADDRESS,
  MIN_WORD_VALUE,
} from "~/config";
import type { LabelMap } from "../compact-labels";
import type { ReadonlyMemory } from "../compute-addresses";
import type { ValidatedInstructionStatement } from "../validate";
import { evaluateExpression } from "./expression";

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
      opSize: "byte" | "word";
      out: RegisterOperand | MemoryOperand;
      src: RegisterOperand | MemoryOperand | ImmediateOperand;
    }
  | {
      type: UnaryInstructionType;
      meta: InstructionMeta;
      opSize: "byte" | "word";
      out: RegisterOperand | MemoryOperand;
    }
  | { type: StackInstructionType; meta: InstructionMeta; out: WordRegisterType }
  | { type: JumpInstructionType; meta: InstructionMeta; jumpTo: number }
  | {
      type: IOInstructionType;
      meta: InstructionMeta;
      opSize: "byte" | "word";
      port:
        | { type: "register"; value: "DX" }
        | { type: "memory-direct"; address: number }
        | { type: "immediate"; value: number };
    }
  | { type: IntInstructionType; meta: InstructionMeta; interruption: typeof INTERRUPTIONS[number] };

export function evaluateInstruction(
  statement: ValidatedInstructionStatement,
  labels: LabelMap,
  readonlyMemory: ReadonlyMemory,
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
              address: evaluateAddress(statement.out.address, labels, readonlyMemory),
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
              address: evaluateAddress(statement.src.address, labels, readonlyMemory),
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
              address: evaluateAddress(statement.out.address, labels, readonlyMemory),
            },
    }))
    .with({ type: stackInstructionPattern }, statement => ({
      type: statement.type,
      meta: cleanMeta(statement),
      out: statement.out,
    }))
    .with({ type: jumpInstructionPattern }, statement => {
      const label = labels.get(statement.jumpTo);
      if (!label) {
        throw new CompilerError(
          `Label ${statement.jumpTo} is not defined.`,
          ...statement.meta.position,
        );
      }
      if (label.type !== "instruction") {
        throw new CompilerError(
          `Label ${statement.jumpTo} is not an instruction label.`,
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
        statement.port.type === "register"
          ? statement.port
          : statement.port.type === "immediate"
          ? {
              ...statement.port,
              value: evaluateImmediate(statement.port.value, "byte", labels),
            }
          : {
              ...statement.port,
              address: evaluateAddress(statement.port.address, labels, readonlyMemory),
            },
    }))
    .with({ type: intInstructionPattern }, statement => {
      const int = evaluateExpression(statement.interruption, labels);

      if (!isMatching(P.union(...INTERRUPTIONS), int)) {
        throw new CompilerError(
          `Invalid interruption number ${int}.`,
          ...statement.interruption.position,
        );
      }

      return {
        type: statement.type,
        meta: cleanMeta(statement),
        interruption: int,
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
  readonlyMemory: ReadonlyMemory,
): number {
  const computed = evaluateExpression(address, labels);
  if (computed < MIN_MEMORY_ADDRESS || computed > MAX_MEMORY_ADDRESS) {
    throw new CompilerError(`Memory address ${address} is out of range.`, ...address.position);
  }
  if (readonlyMemory.has(computed)) {
    throw new CompilerError(
      `Memory address ${hex(computed)} is marked as a read-only data address.`,
      ...address.position,
    );
  }
  return computed;
}

function evaluateImmediate(
  value: NumberExpression,
  size: "byte" | "word",
  labels: LabelMap,
): number {
  const max = size === "byte" ? MAX_BYTE_VALUE : MAX_WORD_VALUE;
  const min = size === "byte" ? MIN_BYTE_VALUE : MIN_WORD_VALUE;
  const computed = evaluateExpression(value, labels);
  if (computed < min || computed > max) {
    throw new CompilerError(
      `Value ${computed} is out of range for ${size} data.`,
      ...value.position,
    );
  }
  return computed;
}
