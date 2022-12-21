import { AnalysisResult, analyze } from "./analyzer";
import { CompilerError } from "./common";
import { Scanner } from "./lexer/scanner";
import { Parser } from "./parser/parser";

export { CompilerError };

export type CompileResultSuccess = Extract<AnalysisResult, { success: true }>;
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
