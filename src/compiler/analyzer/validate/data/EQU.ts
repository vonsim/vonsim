import type { Merge } from "type-fest";
import { CompilerError, PositionRange } from "~/compiler/common";
import type { DataDirectiveStatement, NumberExpression } from "~/compiler/parser/grammar";

export type ValidatedEQU = {
  type: "EQU";
  meta: { label: string; position: PositionRange };
  value: NumberExpression;
};

export function validateEQU(
  equ: Merge<DataDirectiveStatement, { directive: "EQU" }>,
): ValidatedEQU {
  if (equ.values.length !== 1) {
    throw new CompilerError("EQU needs exaclty one operand.", ...equ.position);
  }
  if (equ.values[0].type === "string") {
    throw new CompilerError("EQU can't accept strings.", ...equ.values[0].position);
  }
  if (equ.values[0].type === "unassigned") {
    throw new CompilerError("EQU can't be unassigned.", ...equ.values[0].position);
  }
  if (!equ.label) {
    throw new CompilerError("EQU must have a label.", ...equ.position);
  }

  return {
    type: "EQU",
    meta: { label: equ.label, position: equ.position },
    value: equ.values[0],
  };
}
