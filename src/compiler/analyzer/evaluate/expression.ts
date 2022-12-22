import { match } from "ts-pattern";
import { CompilerError } from "~/compiler/common";
import type { NumberExpression } from "~/compiler/parser/grammar";
import type { LabelMap } from "../compact-labels";

export function evaluateExpression(expr: NumberExpression, labels: LabelMap): number {
  return match(expr)
    .with({ type: "number-literal" }, n => n.value)
    .with({ type: "label" }, l => {
      const label = labels.get(l.value);
      if (!label) throw new CompilerError(`Label "${l.value}" not found`, ...l.position);

      if (l.offset) {
        if (label.type === "constant") {
          throw new CompilerError(`OFFSET cannot be used with EQU labels`, ...l.position);
        }
        return label.address;
      } else {
        if (label.type !== "constant") {
          throw new CompilerError(
            `Label ${l.value} should point to a EQU declaration. Maybe you ment to write OFFSET ${l.value}.`,
            ...l.position,
          );
        }
        return label.value;
      }
    })
    .with({ type: "unary-operation" }, op =>
      op.operator === "+"
        ? evaluateExpression(op.right, labels)
        : -evaluateExpression(op.right, labels),
    )
    .with({ type: "binary-operation" }, op =>
      op.operator === "+"
        ? evaluateExpression(op.left, labels) + evaluateExpression(op.right, labels)
        : op.operator === "-"
        ? evaluateExpression(op.left, labels) - evaluateExpression(op.right, labels)
        : evaluateExpression(op.left, labels) * evaluateExpression(op.right, labels),
    )
    .exhaustive();
}
