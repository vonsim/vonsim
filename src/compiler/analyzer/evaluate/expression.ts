import { match } from "ts-pattern";
import { LineError } from "~/compiler/common";
import type { NumberExpression } from "~/compiler/parser/grammar";
import {
  MAX_BYTE_VALUE,
  MAX_WORD_VALUE,
  MIN_SIGNED_BYTE_VALUE,
  MIN_SIGNED_WORD_VALUE,
} from "~/config";
import type { LabelMap } from "../compact-labels";

export function evaluateImmediate(expr: NumberExpression, size: "byte" | "word", labels: LabelMap) {
  const max = size === "byte" ? MAX_BYTE_VALUE : MAX_WORD_VALUE;
  const min = size === "byte" ? MIN_SIGNED_BYTE_VALUE : MIN_SIGNED_WORD_VALUE;

  const computed = evaluateExpression(expr, labels);
  if (computed < min || computed > max) {
    throw new LineError("value-out-of-range", computed, size, ...expr.position);
  }

  if (computed < 0) {
    return computed + max + 1; // 2's complement
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
