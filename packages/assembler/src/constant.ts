import { CompilerError } from "@/error";
import type { GlobalStore } from "@/global-store";
import type { NumberExpression } from "@/number-expression";
import type { ConstantStatement } from "@/parser/statement";
import type { Position } from "@/position";

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
export class Constant {
  #status: "not-processed" | "processing" | "processed" = "not-processed";
  #value: number | null = null;

  constructor(
    readonly name: string,
    private readonly initialValue: NumberExpression,
    readonly position: Position,
  ) {}

  /**
   * Evaluate the value of a constant.
   * This is done this way because constants can be defined anywhere in the program and
   * can reference other constants, so we need to prevent circular references.
   */
  evaluate(store: GlobalStore): number {
    if (this.#status === "processed") return this.#value!;

    if (this.#status === "processing") {
      // Trying to evaluate a constant that is being evaluated
      throw new CompilerError("circular-reference").at(this.position);
    }

    this.#status = "processed";
    const result = this.initialValue.evaluate(store);
    this.#status = "processed";
    this.#value = result;
    return result;
  }

  /**
   * Create a constant from a statement.
   */
  static fromStatement(statement: ConstantStatement): Constant {
    if (statement.value.isString()) {
      throw new CompilerError("cannot-accept-strings", "EQU").at(statement.value);
    }
    if (statement.value.isUnassigned()) {
      throw new CompilerError("cannot-be-unassinged", "EQU").at(statement.value);
    }

    return new Constant(statement.label, statement.value.value, statement.position);
  }
}
