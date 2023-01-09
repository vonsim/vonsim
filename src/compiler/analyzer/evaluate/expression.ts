import { match } from "ts-pattern";
import { LineError } from "~/compiler/common";
import type { NumberExpression } from "~/compiler/parser/grammar";
import { MAX_VALUE, MIN_SIGNED_VALUE, Size } from "~/config";
import type { LabelMap } from "../compact-labels";

export function evaluateImmediate(expr: NumberExpression, size: Size, labels: LabelMap) {
  const computed = evaluateExpression(expr, labels);
  if (computed < MIN_SIGNED_VALUE[size] || computed > MAX_VALUE[size]) {
    throw new LineError("value-out-of-range", computed, size, ...expr.position);
  }

  if (computed < 0) {
    return computed + MAX_VALUE[size] + 1; // 2's complement
  } else {
    return computed;
  }
}

export function evaluateExpression(expr: NumberExpression, labels: LabelMap): number {
  return match(expr)
    .with({ type: "number-literal" }, n => n.value)
    .with({ type: "label" }, l => {
      const label = labels.get(l.value);
      if (!label) throw new LineError("label-not-found", l.value, ...l.position);

      if (l.offset) {
        if (label.type !== "DB" && label.type !== "DW") {
          throw new LineError("offset-only-with-data-directive", ...l.position);
        }
        return label.address;
      } else {
        if (label.type === "constant") return label.value;
        else if (label.type === "instruction") return label.address;

        throw new LineError("label-should-be-a-number", l.value, ...l.position);
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
