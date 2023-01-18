/**
 * The compiler is responsible for taking the source code and turning it into a program.
 *
 * The compiler is divided into three main parts:
 * 1. The lexer, which turns the source code into a list of tokens.
 * 2. The parser, which turns the tokens into an list of statements.
 * 3. The analyzer, which turns the statements into a program and catches most errors.
 */

import { analyze } from "./analyzer";
import type { CodeMemory } from "./analyzer/compute-addresses";
import type { ProgramConstants } from "./analyzer/evaluate/constants";
import type { ProgramData } from "./analyzer/evaluate/data";
import type { ProgramInstruction } from "./analyzer/evaluate/instruction";
import { CompilerError, LineError } from "./common";
import { Scanner } from "./lexer/scanner";
import { Parser } from "./parser/parser";

export { CompilerError, LineError };
export type { ProgramConstants, ProgramData, ProgramInstruction };

export type Program = {
  constants: ProgramConstants;
  data: ProgramData[];
  instructions: ProgramInstruction[];
  codeMemory: CodeMemory;
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
    const lexed = scanner.scanTokens();

    const parser = new Parser(lexed);
    const parsed = parser.parseTokens();

    const analysis = analyze(parsed);

    if (analysis.success) return analysis;
    else return err(analysis.errors);
  } catch (error) {
    return err([error]);
  }
}

function err(errors: unknown[]): CompileResultError {
  const compilerErrors: CompilerError<any>[] = [];

  for (const error of errors) {
    if (error instanceof CompilerError) {
      compilerErrors.push(error);
    } else {
      compilerErrors.push(new CompilerError("unexpected-error", error));
    }
  }

  return { success: false, errors: compilerErrors };
}
