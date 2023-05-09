import type { Size } from "@/config";

import type { LabelMap } from "../compact-labels";
import type { ValidatedDataStatement } from "../validate";
import { evaluateImmediate } from "./expression";

export type ProgramData = {
  meta: { start: number; length: number };
  size: Size;
  initialValues: (number | null)[];
};

export function evaluateData(statement: ValidatedDataStatement, labels: LabelMap): ProgramData {
  const size = statement.type === "DB" ? "byte" : "word";

  const initialValues = statement.initialValues.map(value => {
    if (value === null) return null;
    else return evaluateImmediate(value, size, labels);
  });

  return {
    meta: { start: statement.meta.start, length: statement.meta.length },
    size,
    initialValues,
  };
}
