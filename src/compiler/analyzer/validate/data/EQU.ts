import type { Merge } from "type-fest";

import { LineError, PositionRange } from "@/compiler/common";
import type { DataDirectiveStatement, NumberExpression } from "@/compiler/parser/grammar";

export type ValidatedEQU = {
  type: "EQU";
  meta: { label: string; position: PositionRange };
  value: NumberExpression;
};

export function validateEQU(
  equ: Merge<DataDirectiveStatement, { directive: "EQU" }>,
): ValidatedEQU {
  if (equ.values.length !== 1) {
    throw new LineError("must-have-one-value", "EQU", ...equ.position);
  }
  if (equ.values[0].type === "string") {
    throw new LineError("cannot-accept-strings", "EQU", ...equ.values[0].position);
  }
  if (equ.values[0].type === "unassigned") {
    throw new LineError("cannot-be-unassinged", "EQU", ...equ.values[0].position);
  }
  if (!equ.label) {
    throw new LineError("must-have-a-label", "EQU", ...equ.position);
  }

  return {
    type: "EQU",
    meta: { label: equ.label, position: equ.position },
    value: equ.values[0],
  };
}
