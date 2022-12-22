import { match } from "ts-pattern";
import { CompilerError } from "~/compiler/common";
import type { NumberExpression } from "~/compiler/parser/grammar";
import type { LabelAddresses } from "../compute-addresses";
import type { ValidatedConstantStatement } from "../validate";

export type ProgramConstants = Map<string, number>;

export function evaluateConstants(
  statements: ValidatedConstantStatement[],
  labels: LabelAddresses,
): ProgramConstants {
  const processed = new Map<
    string,
    | {
        status: "not-processed" | "processing";
        value: NumberExpression;
        meta: ValidatedConstantStatement["meta"];
      }
    | { status: "processed"; value: number; meta: ValidatedConstantStatement["meta"] }
  >();

  // This is a recursive function that evaluates the value of a constant.
  // It's declared inside the function so that it can access the `processed` map,
  // which is used to detect circular dependencies.
  function evaluateConstant(expr: NumberExpression): number {
    return match(expr)
      .with({ type: "number-literal" }, n => n.value)
      .with({ type: "label" }, l => {
        if (l.offset) {
          const address = labels.get(l.value);
          if (address === undefined) {
            throw new CompilerError(`Label "${l.value}" not found`, ...l.position);
          }

          return address;
        } else {
          const c = processed.get(l.value);
          if (!c) throw new CompilerError(`EQU "${l.value}" not found`, ...l.position);

          if (c.status === "processed") return c.value;
          if (c.status === "not-processed") {
            processed.set(l.value, { status: "processing", value: c.value, meta: c.meta });
            const value = evaluateConstant(c.value);
            processed.set(l.value, { status: "processed", value, meta: c.meta });
            return value;
          }

          throw new CompilerError(`Circular reference detected`, ...l.position);
        }
      })
      .with({ type: "unary-operation" }, op =>
        op.operator === "+" ? evaluateConstant(op.right) : -evaluateConstant(op.right),
      )
      .with({ type: "binary-operation" }, op =>
        op.operator === "+"
          ? evaluateConstant(op.left) + evaluateConstant(op.right)
          : op.operator === "-"
          ? evaluateConstant(op.left) - evaluateConstant(op.right)
          : evaluateConstant(op.left) * evaluateConstant(op.right),
      )
      .exhaustive();
  }

  for (const { meta, value } of statements) {
    processed.set(meta.label, { status: "not-processed", value, meta });
  }

  for (const label of processed.keys()) {
    const constant = processed.get(label)!;
    if (constant.status === "processed") continue;
    if (constant.status === "processing") {
      throw new CompilerError(`Circular reference detected`, ...constant.meta.position);
    }

    processed.set(label, { status: "processing", value: constant.value, meta: constant.meta });
    const value = evaluateConstant(constant.value);
    processed.set(label, { status: "processed", value, meta: constant.meta });
  }

  const result: ProgramConstants = new Map();

  processed.forEach((value, key) => {
    if (value.status !== "processed") {
      console.log(processed);
      throw new Error("Mismatch between processed and unprocessed constants");
    }
    result.set(key, value.value);
  });

  return result;
}
