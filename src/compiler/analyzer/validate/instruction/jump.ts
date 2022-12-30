import type { Merge } from "type-fest";
import { CompilerError, JumpInstructionType } from "~/compiler/common";
import type { InstructionStatement } from "~/compiler/parser/grammar";
import type { LabelTypes } from "../../get-label-types";
import type { ValidatedMeta } from "../types";

export type ValidatedJumpInstruction = {
  type: JumpInstructionType;
  meta: ValidatedMeta;
  jumpTo: string;
};

export function validateJumpInstruction(
  instruction: Merge<InstructionStatement, { instruction: JumpInstructionType }>,
  labels: LabelTypes,
): ValidatedJumpInstruction {
  if (instruction.operands.length !== 1) {
    throw new CompilerError("This instruction expects one operand.", ...instruction.position);
  }

  const operand = instruction.operands[0];
  if (operand.type !== "label") {
    throw new CompilerError(
      "This instruction expects a label pointing to an instruction.",
      ...operand.position,
    );
  }

  const label = labels.get(operand.value);
  if (!label) {
    throw new CompilerError(`Label ${operand.value} is not defined.`, ...operand.position);
  }

  if (label !== "instruction") {
    throw new CompilerError(
      "This instruction expects a label pointing to an instruction.",
      ...operand.position,
    );
  }

  return {
    type: instruction.instruction,
    meta: { label: instruction.label, start: 0, length: 3, position: instruction.position },
    jumpTo: operand.value,
  };
}
