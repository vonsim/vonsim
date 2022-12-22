import { klona } from "klona/json";
import { match } from "ts-pattern";
import {
  binaryInstructionPattern,
  intInstructionPattern,
  ioInstructionPattern,
  jumpInstructionPattern,
  stackInstructionPattern,
  unaryInstructionPattern,
  zeroaryInstructionPattern,
} from "~/compiler/common/patterns";
import type { Statement } from "~/compiler/parser/grammar";
import type { LabelTypes } from "../get-label-types";
import { validateDB } from "./data/DB";
import { validateDW } from "./data/DW";
import { validateEQU } from "./data/EQU";
import { validateBinaryInstruction } from "./instruction/binary";
import { validateIntInstruction } from "./instruction/int";
import { validateIOInstruction } from "./instruction/io";
import { validateJumpInstruction } from "./instruction/jump";
import { validateStackInstruction } from "./instruction/stack";
import { validateUnaryInstruction } from "./instruction/unary";
import { validateZeroaryInstruction } from "./instruction/zeroary";
import type {
  ValidatedConstantStatement,
  ValidatedDataStatement,
  ValidatedInstructionStatement,
  ValidatedMeta,
  ValidatedStatement,
} from "./types";

export function validateStatement(statement: Statement, labels: LabelTypes): ValidatedStatement {
  const result = match(statement)
    .with({ type: "origin-change" }, statement => statement)
    .with({ directive: "DB" }, validateDB)
    .with({ directive: "DW" }, validateDW)
    .with({ directive: "EQU" }, validateEQU)
    .with({ instruction: zeroaryInstructionPattern }, validateZeroaryInstruction)
    .with({ type: "instruction", instruction: binaryInstructionPattern }, statement =>
      validateBinaryInstruction(statement, labels),
    )
    .with({ instruction: unaryInstructionPattern }, statement =>
      validateUnaryInstruction(statement, labels),
    )
    .with({ instruction: stackInstructionPattern }, validateStackInstruction)
    .with({ instruction: jumpInstructionPattern }, statement =>
      validateJumpInstruction(statement, labels),
    )
    .with({ instruction: ioInstructionPattern }, statement =>
      validateIOInstruction(statement, labels),
    )
    .with({ instruction: intInstructionPattern }, validateIntInstruction)
    .exhaustive();

  return klona(result);
}

export type {
  ValidatedConstantStatement,
  ValidatedDataStatement,
  ValidatedInstructionStatement,
  ValidatedMeta,
  ValidatedStatement,
};
