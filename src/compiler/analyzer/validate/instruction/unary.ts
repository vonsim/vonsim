import { isMatching, match } from "ts-pattern";
import type { Merge } from "type-fest";
import { CompilerError, RegisterType, UnaryInstructionType } from "~/compiler/common";
import { wordRegisterPattern } from "~/compiler/common/patterns";
import type { InstructionStatement, NumberExpression, Operand } from "~/compiler/parser/grammar";
import type { LabelTypes } from "../../get-label-types";
import type { ValidatedMeta } from "../types";

type RegisterOperand = { type: "register"; register: RegisterType };
type MemoryOperand = { type: "memory" } & (
  | { mode: "direct"; address: NumberExpression }
  | { mode: "indirect" }
);

export type ValidatedUnaryInstruction = {
  type: UnaryInstructionType;
  meta: ValidatedMeta;
  opSize: "byte" | "word";
  out: RegisterOperand | MemoryOperand;
};

export function validateUnaryInstruction(
  instruction: Merge<InstructionStatement, { instruction: UnaryInstructionType }>,
  labels: LabelTypes,
): ValidatedUnaryInstruction {
  if (instruction.operands.length !== 1) {
    throw new CompilerError("This instruction expects one operand.", ...instruction.position);
  }

  return match<Operand, ValidatedUnaryInstruction>(instruction.operands[0])
    .with({ type: "immediate" }, out => {
      throw new CompilerError("The destination can't be an immediate value.", ...out.position);
    })
    .with({ type: "register" }, out => {
      const reg = typeGuardRegister(out);
      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 2, position: instruction.position },
        opSize: reg.size,
        out: { type: "register", register: reg.value },
      };
    })
    .with({ type: "label" }, out => {
      const outType = getLabelType(out, labels);

      const outSize = outType === "DB" ? "byte" : outType === "DW" ? "word" : false;
      if (!outSize) {
        throw new CompilerError(
          `Label ${out.label} doesn't point to a writable memory address — should point to a DB or DW declaration.`,
          ...out.position,
        );
      }

      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 3, position: instruction.position },
        opSize: outSize,
        out: labelToMemoryDirect(out),
      };
    })
    .with({ type: "address", mode: "direct" }, out => {
      if (out.size === "auto") {
        throw new CompilerError(
          "Addressing an unknown memory address requires specifying the type of pointer with WORD PTR or BYTE PTR before the address.",
          ...out.position,
        );
      }

      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 3, position: instruction.position },
        opSize: out.size,
        out: { type: "memory", mode: "direct", address: out.value },
      };
    })
    .with({ type: "address", mode: "indirect" }, out => {
      if (out.size === "auto") {
        throw new CompilerError(
          "Addressing an unknown memory address requires specifying the type of pointer with WORD PTR or BYTE PTR before the address.",
          ...out.position,
        );
      }

      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 1, position: instruction.position },
        opSize: out.size,
        out: { type: "memory", mode: "indirect" },
      };
    })
    .exhaustive();
}

function typeGuardRegister(reg: Extract<Operand, { type: "register" }>) {
  if (isMatching(wordRegisterPattern, reg.value)) {
    return { type: "register", size: "word", value: reg.value, position: reg.position } as const;
  } else {
    return { type: "register", size: "byte", value: reg.value, position: reg.position } as const;
  }
}

function getLabelType(operand: Extract<Operand, { type: "label" }>, labels: LabelTypes) {
  const labelType = labels.get(operand.label);
  if (!labelType) {
    throw new CompilerError(`Label ${operand.label} is not defined.`, ...operand.position);
  }
  return labelType;
}

function labelToMemoryDirect(
  label: Extract<Operand, { type: "label" }>,
): Extract<MemoryOperand, { mode: "direct" }> {
  return {
    type: "memory",
    mode: "direct",
    address: { type: "label", offset: true, value: label.label, position: label.position },
  };
}
