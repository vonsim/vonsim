import { analyze } from "./analyzer";
import type { ReadonlyMemory } from "./analyzer/compute-addresses";
import type { ProgramConstants } from "./analyzer/evaluate/constants";
import type { ProgramData } from "./analyzer/evaluate/data";
import type { ProgramInstruction } from "./analyzer/evaluate/instruction";
import { CompilerError } from "./common";
import { Scanner } from "./lexer/scanner";
import { Parser } from "./parser/parser";

export { CompilerError };
export type { ProgramConstants, ProgramData, ProgramInstruction };

export type Program = {
  constants: ProgramConstants;
  data: ProgramData[];
  instructions: ProgramInstruction[];
  readonlyMemory: ReadonlyMemory;
};

export type CompileResultSuccess = { success: true } & Program;
export type CompileResultError = {
  success: false;
  lineErrors: CompilerError[];
  codeErrors: string[];
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
    else return groupErrors(analysis);
  } catch (error) {
    return groupErrors({ success: false, errors: [error] });
  }
}

function groupErrors({ errors }: { success: false; errors: unknown[] }): CompileResultError {
  const lineErrors: CompilerError[] = [];
  const codeErrors: string[] = [];

  for (const error of errors) {
    if (error instanceof CompilerError) {
      lineErrors.push(error);
    } else {
      codeErrors.push(String(error));
    }
  }

  return { success: false, lineErrors, codeErrors };
}
