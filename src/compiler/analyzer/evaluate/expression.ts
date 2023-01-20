import { match } from "ts-pattern";

import { CompilerError } from "@/compiler/common";
import type { NumberExpression } from "@/compiler/parser/grammar";
import { MAX_VALUE, MIN_SIGNED_VALUE, Size } from "@/config";

import type { LabelMap } from "../compact-labels";

export function evaluateImmediate(expr: NumberExpression, size: Size, labels: LabelMap) {
  const computed = evaluateExpression(expr, labels);
  if (computed < MIN_SIGNED_VALUE[size] || computed > MAX_VALUE[size]) {
    throw new CompilerError("value-out-of-range", computed, size).at(expr);
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
    .with({ type: "label" }, label => {
      const meta = labels.get(label.value);
      if (!meta) throw new CompilerError("label-not-found", label.value).at(label);

      if (label.offset) {
        if (meta.type !== "DB" && meta.type !== "DW") {
          throw new CompilerError("offset-only-with-data-directive").at(label);
        }
        return meta.address;
      } else {
        if (meta.type === "constant") return meta.value;
        else if (meta.type === "instruction") return meta.address;

        throw new CompilerError("label-should-be-a-number", label.value).at(label);
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
