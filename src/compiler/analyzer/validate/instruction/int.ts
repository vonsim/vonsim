import { isMatching } from "ts-pattern";
import type { Merge } from "type-fest";

import { IntInstructionType, LineError } from "@/compiler/common";
import {
  InstructionStatement,
  NumberExpression,
  numberExpressionPattern,
} from "@/compiler/parser/grammar";

import type { ValidatedMeta } from "../types";

export type ValidatedIntInstruction = {
  type: IntInstructionType;
  meta: ValidatedMeta;
  interrupt: NumberExpression;
};

export function validateIntInstruction(
  instruction: Merge<InstructionStatement, { instruction: IntInstructionType }>,
): ValidatedIntInstruction {
  if (instruction.operands.length !== 1) {
    throw new LineError("expects-one-operand", ...instruction.position);
  }

  const operand = instruction.operands[0];

  if (!isMatching(numberExpressionPattern, operand)) {
    throw new LineError("expects-immediate", ...operand.position);
  }

  return {
    type: instruction.instruction,
    meta: { label: instruction.label, start: 0, length: 2, position: instruction.position },
    interrupt: operand,
  };
}
