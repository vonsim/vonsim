import type { Token } from "~/compiler/lexer/tokens";
import type { Position } from "./index";

export class CompilerError extends Error {
  constructor(message: string, public readonly from: Position, public readonly to: Position) {
    super(message);
  }

  static fromToken(message: string, token: Token) {
    return new CompilerError(message, token.position, token.position + token.lexeme.length);
  }

  toString() {
    return `${this.message} (${this.from} - ${this.to})`;
  }
}
