import { forEachWithErrors } from "@vonsim/common/loops";

import { AssemblerError } from "./error";
import { GlobalStore } from "./global-store";
import { Scanner } from "./lexer/scanner";
import { Parser } from "./parser";
import type { Data, InstructionStatement } from "./statements";

export type Program = {
  data: Data[];
  instructions: InstructionStatement[];
};

export type AssembleResultSuccess = { success: true } & Program;
export type AssembleResultError = {
  success: false;
  errors: AssemblerError<any>[];
};
export type AssembleResult = AssembleResultSuccess | AssembleResultError;

/**
 * Assembles the source code into a program.
 *
 * The source code must be a valid assembly program as described in the
 * {@link https://vonsim.github.io/en/computer/assembly | documentation}.
 *
 * It should never throw an error, but it can return a list of errors.
 */
export function assemble(source: string): AssembleResult {
  try {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();

    const parser = new Parser(tokens);
    const statements = parser.parse();

    const lastStatement = statements.at(-1);

    if (!lastStatement) throw new AssemblerError("empty-program");
    if (!lastStatement.isEnd()) {
      throw new AssemblerError("end-must-be-the-last-statement").at(lastStatement);
    }

    let errors: AssemblerError<any>[] = [];

    // Global store for the program.
    // Stores labels, constants and reserved memory.
    const store = new GlobalStore();

    // Store labels with their types (we can't compute their addresses yet)
    // Also stores constants.
    errors = store.loadStatements(statements);
    if (errors.length > 0) return { success: false, errors };

    // Validate statements
    errors = forEachWithErrors(
      statements,
      statement => {
        if (statement.isOriginChange() || statement.isEnd()) return;
        statement.validate(store);
      },
      AssemblerError.from,
    );
    if (errors.length > 0) return { success: false, errors };

    // Compute the addresses of each instruction and data directive.
    errors = store.computeAddresses(statements);
    if (errors.length > 0) return { success: false, errors };

    // Now that we know the addresses of each instruction and data directive,
    // we can compute the values of the operands.
    const data: Data[] = [];
    const instructions: InstructionStatement[] = [];
    errors = forEachWithErrors(
      statements,
      item => {
        if (item.isDataDirective()) {
          if (item.directive === "EQU") {
            item.evaluateExpressions(store);
          } else {
            const errs = item.evaluateExpressions(store); // Return posible errors
            data.push(item);
            return errs;
          }
        } else if (item.isInstruction()) {
          item.evaluateExpressions(store);
          instructions.push(item);
        }
      },
      AssemblerError.from,
    );
    if (errors.length > 0) return { success: false, errors };

    return { success: true, data, instructions };
  } catch (error) {
    return { success: false, errors: [AssemblerError.from(error)] };
  }
}

export type * from "./statements";
export { unassigned } from "./statements";
export * from "./syscalls";
export * from "./types";
