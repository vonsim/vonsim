import { isMatching } from "ts-pattern";
import type { Merge } from "type-fest";

import { CompilerError, IntInstructionType } from "@/compiler/common";
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
    throw new CompilerError("expects-one-operand").at(instruction);
  }

  const operand = instruction.operands[0];

  if (!isMatching(numberExpressionPattern, operand)) {
    throw new CompilerError("expects-immediate").at(operand);
  }

  return {
    type: instruction.instruction,
    meta: { label: instruction.label, start: 0, length: 2, position: instruction.position },
    interrupt: operand,
  };
}
