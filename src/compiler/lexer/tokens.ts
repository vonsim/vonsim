import type { KeywordType, Position } from "@/compiler/common";

export type Token = {
  type: TokenType;
  /** The literal text found in the source code */
  lexeme: string;
  /** @see {@link Position} */
  position: Position;
};

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
  | KeywordType
  // ...
  | "EOL"
  | "EOF";
