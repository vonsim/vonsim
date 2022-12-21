import type { PositionRange } from "~/compiler/common";
import type { OriginChangeStatement } from "~/compiler/parser/grammar";
import type { ValidatedDB } from "./data/DB";
import type { ValidatedDW } from "./data/DW";
import type { ValidatedEQU } from "./data/EQU";
import type { ValidatedBinaryInstruction } from "./instruction/binary";
import type { ValidatedIntInstruction } from "./instruction/int";
import type { ValidatedIOInstruction } from "./instruction/io";
import type { ValidatedJumpInstruction } from "./instruction/jump";
import type { ValidatedStackInstruction } from "./instruction/stack";
import type { ValidatedUnaryInstruction } from "./instruction/unary";
import type { ValidatedZeroaryInstruction } from "./instruction/zeroary";

export type ValidatedMeta = {
  label: string | null;
  /** The starting memory address */
  start: number;
  /**
   * Returns the size of a statement in bytes.
   * @see /docs/especificaciones/codificacion.md
   */
  length: number;
  position: PositionRange;
};

export type ValidatedStatement =
  | OriginChangeStatement
  | ValidatedDB
  | ValidatedDW
  | ValidatedEQU
  | ValidatedZeroaryInstruction
  | ValidatedBinaryInstruction
  | ValidatedUnaryInstruction
  | ValidatedStackInstruction
  | ValidatedJumpInstruction
  | ValidatedIOInstruction
  | ValidatedIntInstruction;

export type ValidatedConstantStatement = ValidatedEQU;
export type ValidatedDataStatement = ValidatedDB | ValidatedDW;
export type ValidatedInstructionStatement =
  | ValidatedZeroaryInstruction
  | ValidatedBinaryInstruction
  | ValidatedUnaryInstruction
  | ValidatedStackInstruction
  | ValidatedJumpInstruction
  | ValidatedIOInstruction
  | ValidatedIntInstruction;
