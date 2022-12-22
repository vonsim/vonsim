import type { Merge } from "type-fest";
import { CompilerError, ZeroaryInstructionType } from "~/compiler/common";
import type { InstructionStatement } from "~/compiler/parser/grammar";
import type { ValidatedMeta } from "../types";

export type ValidatedZeroaryInstruction = {
  type: ZeroaryInstructionType;
  meta: ValidatedMeta;
};

export function validateZeroaryInstruction(
  instruction: Merge<InstructionStatement, { instruction: ZeroaryInstructionType }>,
): ValidatedZeroaryInstruction {
  if (instruction.operands.length > 0) {
    throw new CompilerError(
      "This instruction doesn't accept any operands.",
      ...instruction.position,
    );
  }

  return {
    type: instruction.instruction,
    meta: { label: instruction.label, start: 0, length: 1, position: instruction.position },
  };
}
