import type { Merge } from "type-fest";
import { LineError, PositionRange } from "~/compiler/common";
import type { DataDirectiveStatement, NumberExpression } from "~/compiler/parser/grammar";
import type { ValidatedMeta } from "../types";

export type ValidatedDB = {
  type: "DB";
  meta: ValidatedMeta;
  initialValues: (NumberExpression | null)[];
};

export function validateDB(db: Merge<DataDirectiveStatement, { directive: "DB" }>): ValidatedDB {
  const initialValues: ValidatedDB["initialValues"] = [];

  for (const value of db.values) {
    if (value.type === "string") {
      const str = value.value;
      for (let i = 0; i < str.length; i++) {
        const pos = value.position[0] + i;
        initialValues.push({
          type: "number-literal",
          value: str.charCodeAt(i),
          position: [pos, pos + 1] as PositionRange,
        });
      }
    } else if (value.type === "unassigned") {
      initialValues.push(null);
    } else {
      initialValues.push(value);
    }
  }

  if (initialValues.length === 0) {
    throw new LineError("must-have-one-or-more-values", "DB", ...db.position);
  }

  return {
    type: "DB",
    meta: { label: db.label, start: 0, length: initialValues.length, position: db.position },
    initialValues,
  };
}
