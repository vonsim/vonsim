/**
 * The compiler is responsible for taking the source code and turning it into a program.
 *
 * The compiler is divided into three main parts:
 * 1. The lexer, which turns the source code into a list of tokens.
 * 2. The parser, which turns the tokens into an list of statements.
 * 3. The analyzer, which turns the statements into a program and catches most errors.
 */

import { forEachWithErrors } from "@vonsim/common/loops";

import { CompilerError } from "@/error";
import { GlobalStore } from "@/global-store";
import { Scanner } from "@/lexer/scanner";
import { Parser } from "@/parser";
import { DataDirectiveStatementType, InstructionStatementType } from "@/statements";

export type Program = {
  data: DataDirectiveStatementType[];
  instructions: InstructionStatementType[];
  store: GlobalStore;
};

export type CompileResultSuccess = { success: true } & Program;
export type CompileResultError = {
  success: false;
  errors: CompilerError<any>[];
};
export type CompileResult = CompileResultSuccess | CompileResultError;

export function compile(source: string): CompileResult {
  try {
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();

    const parser = new Parser(tokens);
    const statements = parser.parse();

    const lastStatement = statements.at(-1);

    if (!lastStatement) throw new CompilerError("empty-program");
    if (!lastStatement.isEnd()) {
      throw new CompilerError("end-must-be-the-last-statement").at(lastStatement);
    }

    let errors: CompilerError<any>[] = [];

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
      CompilerError.from,
    );
    if (errors.length > 0) return { success: false, errors };

    // Compute the addresses of each instruction and data directive.
    errors = store.computeAddresses(statements);
    if (errors.length > 0) return { success: false, errors };

    // Now that we know the addresses of each instruction and data directive,
    // we can compute the values of the operands.
    const data: DataDirectiveStatementType[] = [];
    const instructions: InstructionStatementType[] = [];
    errors = forEachWithErrors(
      statements,
      item => {
        if (item.isDataDirective()) {
          item.evaluateExpressions(store);
          data.push(item);
        } else if (item.isInstruction()) {
          item.evaluateExpressions(store);
          instructions.push(item);
        }
      },
      CompilerError.from,
    );
    if (errors.length > 0) return { success: false, errors };

    return { success: true, data, instructions, store };
  } catch (error) {
    return { success: false, errors: [CompilerError.from(error)] };
  }
}
