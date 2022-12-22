import { CompilerError } from "~/compiler/common";
import { MAX_BYTE_VALUE, MAX_WORD_VALUE, MIN_BYTE_VALUE, MIN_WORD_VALUE } from "~/config";
import type { LabelMap } from "../compact-labels";
import type { ValidatedDataStatement } from "../validate";
import { evaluateExpression } from "./expression";

export type ProgramData = {
  meta: { start: number; length: number };
  size: "byte" | "word";
  initialValues: (number | null)[];
};

export function evaluateData(statement: ValidatedDataStatement, labels: LabelMap): ProgramData {
  const size = statement.type === "DB" ? "byte" : "word";
  const max = size === "byte" ? MAX_BYTE_VALUE : MAX_WORD_VALUE;
  const min = size === "byte" ? MIN_BYTE_VALUE : MIN_WORD_VALUE;

  const initialValues = statement.initialValues.map(value => {
    if (value === null) return null;

    const computed = evaluateExpression(value, labels);
    if (computed < min || computed > max) {
      throw new CompilerError(
        `Value ${computed} is out of range for ${size} data.`,
        ...value.position,
      );
    }
    return computed;
  });

  return {
    meta: { start: statement.meta.start, length: statement.meta.length },
    size,
    initialValues,
  };
}
