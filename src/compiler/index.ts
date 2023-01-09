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
  lineErrors: LineError<any>[];
  codeErrors: CompilerError<any>[];
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
  const lineErrors: LineError<any>[] = [];
  const codeErrors: CompilerError<any>[] = [];

  for (const error of errors) {
    if (error instanceof LineError) {
      lineErrors.push(error);
    } else if (error instanceof CompilerError) {
      codeErrors.push(error);
    } else {
      codeErrors.push(new CompilerError("unexpected-error", error));
    }
  }

  return { success: false, lineErrors, codeErrors };
}
