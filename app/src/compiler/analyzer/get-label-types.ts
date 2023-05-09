import type { Statement } from "@/compiler/parser/grammar";

export type LabelTypes = Map<string, "DB" | "DW" | "EQU" | "instruction">;

export function getLabelTypes(statements: Statement[]): LabelTypes {
  const labels: LabelTypes = new Map();

  for (const statement of statements) {
    if (statement.type === "origin-change") continue;
    if (statement.type === "end") continue;
    if (!statement.label) continue;

    if (statement.type === "data") {
      labels.set(statement.label, statement.directive);
    } else {
      labels.set(statement.label, "instruction");
    }
  }

  return labels;
}
