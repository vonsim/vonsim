import { match, P } from "ts-pattern";
import type { Merge } from "type-fest";
import { CompilerError, IOInstructionType } from "~/compiler/common";
import type { InstructionStatement, NumberExpression, Operand } from "~/compiler/parser/grammar";
import type { LabelTypes } from "../../get-label-types";
import type { ValidatedMeta } from "../types";

export type ValidatedIOInstruction = {
  type: IOInstructionType;
  meta: ValidatedMeta;
  opSize: "byte" | "word";
  port:
    | { type: "register"; value: "DX" }
    | { type: "memory-direct"; address: NumberExpression }
    | { type: "immediate"; value: NumberExpression };
};

export function validateIOInstruction(
  instruction: Merge<InstructionStatement, { instruction: IOInstructionType }>,
  labels: LabelTypes,
): ValidatedIOInstruction {
  if (instruction.operands.length !== 2) {
    throw new CompilerError("This instruction expects two operands.", ...instruction.position);
  }

  const internal = instruction.operands[instruction.instruction === "IN" ? 0 : 1];
  const external = instruction.operands[instruction.instruction === "IN" ? 1 : 0];

  if (internal.type !== "register" || (internal.value !== "AX" && internal.value !== "AL")) {
    throw new CompilerError("IN expects AX or AL as its first operand.", ...internal.position);
  }

  const opSize = internal.value === "AX" ? "word" : "byte";

  return match<Operand, ValidatedIOInstruction>(external)
    .with({ type: "register" }, reg => {
      if (reg.value !== "DX") {
        throw new CompilerError("The only valid register is DX.", ...reg.position);
      }

      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 1, position: instruction.position },
        opSize,
        port: { type: "register", value: reg.value },
      };
    })
    .with({ type: "immediate", value: P.select() }, value => {
      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 2, position: instruction.position },
        opSize,
        port: { type: "immediate", value: value },
      };
    })
    .with({ type: "label" }, external => {
      const label = labels.get(external.label);

      if (label === "EQU") {
        return {
          type: instruction.instruction,
          meta: { label: instruction.label, start: 0, length: 2, position: instruction.position },
          opSize,
          port: {
            type: "immediate",
            value: {
              type: "label",
              offset: false,
              value: external.label,
              position: external.position,
            },
          },
        };
      }

      if (label !== "DB") {
        throw new CompilerError(
          "The only label this instruction can accept is a DB declaration.",
          ...external.position,
        );
      }

      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 3, position: instruction.position },
        opSize,
        port: {
          type: "memory-direct",
          address: {
            type: "label",
            offset: true,
            value: external.label,
            position: external.position,
          },
        },
      };
    })
    .with({ type: "address" }, external => {
      if (external.mode === "indirect") {
        throw new CompilerError(
          "This instruction doesn't accept indirect address mode.",
          ...external.position,
        );
      }

      if (external.size === "word") {
        throw new CompilerError(
          "This instruction doesn't accept word-sized operands.",
          ...external.position,
        );
      }

      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 3, position: instruction.position },
        opSize,
        port: { type: "memory-direct", address: external.value },
      };
    })
    .exhaustive();
}
