import type { Token } from "~/compiler/lexer/tokens";
import { Language } from "~/config";
import { CompilerErrorCode, CompilerErrorParams, ERROR_LIST } from "./error-list";
import type { Position } from "./index";

export class CompilerError<Code extends CompilerErrorCode> {
  private readonly params: CompilerErrorParams<Code>;

  constructor(
    public readonly code: Code,
    public readonly from: Position,
    public readonly to: Position,
    ...params: CompilerErrorParams<Code>
  ) {
    this.params = params;
  }

  static fromToken<Code extends CompilerErrorCode>(
    code: Code,
    token: Token,
    ...params: CompilerErrorParams<Code>
  ) {
    return new CompilerError(code, token.position, token.position + token.lexeme.length, ...params);
  }

  message(lang: Language) {
    // @ts-expect-error - TypeScript doesn't like '...this.params', for some reason.
    return ERROR_LIST[this.code](...this.params)[lang];
  }

  toString() {
    return `${this.message("en")} (${this.from} - ${this.to})`;
  }
}
