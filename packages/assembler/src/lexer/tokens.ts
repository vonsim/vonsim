import type { Position } from "@/position";
import type { Keyword } from "@/types";

export type TokenType =
  // Single-character tokens.
  | "LEFT_PAREN"
  | "RIGHT_PAREN"
  | "LEFT_BRACKET"
  | "RIGHT_BRACKET"
  | "COMMA"
  | "QUESTION_MARK"
  | "PLUS"
  | "MINUS"
  | "ASTERISK"
  // Literals.
  | "IDENTIFIER"
  | "LABEL"
  | "STRING"
  | "NUMBER"
  // Keywords.
  | Keyword
  // ...
  | "EOL"
  | "EOF";

/**
 * A token produced by the lexer.
 *
 * ---
 * This class is: IMMUTABLE
 */
export class Token {
  readonly type: TokenType;
  readonly lexeme: string;
  readonly position: Position;

  constructor(type: TokenType, lexeme: string, position: Position) {
    this.type = type;
    this.lexeme = lexeme;
    this.position = position;
  }
}
