import { isMatching } from "ts-pattern";
import type { Merge } from "type-fest";
import { LineError, StackInstructionType, WordRegisterType } from "~/compiler/common";
import { wordRegisterPattern } from "~/compiler/common/patterns";
import type { InstructionStatement } from "~/compiler/parser/grammar";
import type { ValidatedMeta } from "../types";

export type ValidatedStackInstruction = {
  type: StackInstructionType;
  meta: ValidatedMeta;
  register: WordRegisterType;
};

export function validateStackInstruction(
  instruction: Merge<InstructionStatement, { instruction: StackInstructionType }>,
): ValidatedStackInstruction {
  if (instruction.operands.length !== 1) {
    throw new LineError("expects-one-operand", ...instruction.position);
  }

  const operand = instruction.operands[0];
  if (operand.type !== "register" || !isMatching(wordRegisterPattern, operand.value)) {
    throw new LineError("expects-word-register", ...operand.position);
  }

  return {
    type: instruction.instruction,
    meta: { label: instruction.label, start: 0, length: 2, position: instruction.position },
    register: operand.value,
  };
}
