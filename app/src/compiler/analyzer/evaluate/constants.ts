import { match } from "ts-pattern";

import { CompilerError } from "@/compiler/common";
import type { NumberExpression } from "@/compiler/parser/grammar";

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
      .with({ type: "label" }, label => {
        const meta = labels.get(label.value);

        if (label.offset) {
          if (!meta) throw new CompilerError("label-not-found", label.value).at(label);
          if (meta.type !== "DB" && meta.type !== "DW") {
            throw new CompilerError("offset-only-with-data-directive").at(label);
          }
          return meta.address;
        } else if (meta) {
          if (meta.type === "instruction") return meta.address;
          else throw new CompilerError("label-should-be-a-number", label.value).at(label);
        } else {
          const constant = processed.get(label.value);
          if (!constant) throw new CompilerError("equ-not-found", label.value).at(label);

          if (constant.status === "processed") return constant.value;
          if (constant.status === "not-processed") {
            processed.set(label.value, { ...constant, status: "processing" });
            const value = evaluateConstant(constant.value);
            processed.set(label.value, { status: "processed", value, meta: constant.meta });
            return value;
          }

          throw new CompilerError("circular-reference").at(label);
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
      throw new CompilerError("circular-reference").at(constant);
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
