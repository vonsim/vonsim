import { match } from "ts-pattern";
import type { Merge } from "type-fest";
import { IOInstructionType, LineError } from "~/compiler/common";
import {
  InstructionStatement,
  NumberExpression,
  numberExpressionPattern,
  Operand,
} from "~/compiler/parser/grammar";
import type { Size } from "~/config";
import type { LabelTypes } from "../../get-label-types";
import type { ValidatedMeta } from "../types";

export type ValidatedIOInstruction = {
  type: IOInstructionType;
  meta: ValidatedMeta;
  opSize: Size;
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
    throw new LineError("expects-two-operands", ...instruction.position);
  }

  const internal = instruction.operands[instruction.instruction === "IN" ? 0 : 1];
  const external = instruction.operands[instruction.instruction === "IN" ? 1 : 0];

  if (internal.type !== "register" || (internal.value !== "AX" && internal.value !== "AL")) {
    throw new LineError("expects-ax", ...internal.position);
  }

  const opSize = internal.value === "AX" ? "word" : "byte";

  return match<Operand, ValidatedIOInstruction>(external)
    .with({ type: "register" }, reg => {
      if (reg.value !== "DX") {
        throw new LineError("expects-dx", ...reg.position);
      }

      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 1, position: instruction.position },
        opSize,
        port: { type: "register", value: reg.value },
      };
    })
    .with({ type: "address", mode: "direct" }, external => {
      if (external.size === "word") {
        throw new LineError("cannot-be-word", ...external.position);
      }

      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 3, position: instruction.position },
        opSize,
        port: { type: "memory-direct", address: external.value },
      };
    })
    .with({ type: "address", mode: "indirect" }, external => {
      throw new LineError("cannot-be-indirect", ...external.position);
    })
    .with(numberExpressionPattern, external => {
      if (external.type === "label" && !external.offset) {
        const label = labels.get(external.value);
        if (label === "DW") {
          throw new LineError("cannot-be-word", ...external.position);
        }
        if (label === "DB") {
          return {
            type: instruction.instruction,
            meta: { label: instruction.label, start: 0, length: 3, position: instruction.position },
            opSize,
            port: {
              type: "memory-direct",
              address: {
                type: "label",
                offset: true,
                value: external.value,
                position: external.position,
              },
            },
          };
        }
      }

      return {
        type: instruction.instruction,
        meta: { label: instruction.label, start: 0, length: 2, position: instruction.position },
        opSize,
        port: { type: "immediate", value: external },
      };
    })
    .exhaustive();
}
