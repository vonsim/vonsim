import { CompilerError } from "@/error";
import type { GlobalStore } from "@/global-store";
import type { NumberExpression } from "@/number-expression";
import type { Position } from "@/position";

import { DataDirectiveStatement } from ".";
import type { DataDirectiveValue } from "./value";

/**
 * A constant.
 *
 * ```vonsim
 * my_constant EQU 42
 * ```
 *
 * Constants are evaluated at compile time and can be used anywhere in the program.
 * They can only have a single value. It can't be a string nor unassigned. Also, it needs a label.
 *
 * When a constant is created, a generic NumberExpression is assigned as its initial value.
 * Once all constants have been created and mapped to their labels (@see {@link GlobalStore}),
 * we can start evaluating the constants and get their actual values.
 *
 * Each time the assembler encounters a constant, it will evaluate it.
 * Three options are possible:
 * - The constant has already been evaluated (status = "processed"): returns the previously evaluated value
 * - The constant has not been evaluated yet (status = "not-processed"): evaluates the constant and returns the value
 * - The constant is currently being evaluated (status = "processing"): throw an error
 *
 * Since constants can reference other constants (see @see {@link NumberExpression}), we need to prevent circular references.
 * This is why we need to keep track of the status of each constant.
 *
 * ---
 * This class is: MUTABLE
 */
export class Constant extends DataDirectiveStatement {
  readonly directive = "EQU";
  #status: "not-processed" | "processing" | "processed" = "not-processed";
  #initialValue: NumberExpression | null = null;
  #value: number | null = null;

  constructor(values: DataDirectiveValue[], label: string | null, position: Position) {
    super(values, label, position);
  }

  validate(): void {
    if (this.#initialValue) throw new Error("Constant already validated");

    if (!this.label) {
      throw new CompilerError("constant-must-have-a-label").at(this);
    }

    if (this.values.length !== 1) {
      throw new CompilerError("constant-must-have-one-value").at(this);
    }

    const value = this.values[0];
    if (value.type === "string") {
      throw new CompilerError("cannot-accept-strings", "EQU").at(value);
    }
    if (value.type === "unassigned") {
      throw new CompilerError("cannot-be-unassinged", "EQU").at(value);
    }
    this.#initialValue = value.value;
  }

  evaluateExpressions(store: GlobalStore): number {
    if (!this.#initialValue) throw new Error("Constant not validated");

    if (this.#status === "processed") return this.#value!;

    if (this.#status === "processing") {
      // Trying to evaluate a constant that is being evaluated
      throw new CompilerError("circular-reference").at(this.position);
    }

    this.#status = "processed";
    const result = this.#initialValue.evaluate(store);
    this.#status = "processed";
    this.#value = result;
    return result;
  }

  // Alias for evaluateExpressions
  evaluate(store: GlobalStore) {
    return this.evaluateExpressions(store);
  }
}
