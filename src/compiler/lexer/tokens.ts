import type { Position } from "../common";

export type Token = {
  type: TokenType;
  lexeme: string;
  position: Position;
};

export type TokenType =
  // Single-character tokens.
  | "LEFT_BRACKET"
  | "RIGHT_BRACKET"
  | "COMMA"
  | "COLON"
  | "QUESTION_MARK"
  | "PLUS"
  | "MINUS"
  | "ASTERISK"
  // Literals.
  | "IDENTIFIER"
  | "STRING"
  | "NUMBER"
  // Keywords.
  | KeywordType
  // ...
  | "EOL"
  | "EOF";

export const INSTRUCTIONS = [
  // Transfer
  "MOV",
  "PUSH",
  "POP",
  "PUSHF",
  "POPF",
  "IN",
  "OUT",
  // Arithmetic
  "ADD",
  "ADC",
  "SUB",
  "SBB",
  "CMP",
  "NEG",
  "INC",
  "DEC",
  // Logical
  "AND",
  "OR",
  "XOR",
  "NOT",
  // Control
  "CALL",
  "RET",
  "JZ",
  "JNZ",
  "JS",
  "JNS",
  "JC",
  "JNC",
  "JO",
  "JNO",
  "JMP",
  // Interrupts
  "INT",
  "IRET",
  "CLI",
  "STI",
  // Extras
  "NOP",
  "HLT",
] as const;

export type InstructionType = typeof INSTRUCTIONS[number];

export const KEYWORDS = [
  "OFFSET",
  "ORG",
  "DB",
  "DW",
  "EQU",
  "BYTE",
  "WORD",
  "PTR",
  "END",
  ...INSTRUCTIONS,
] as const;

export type KeywordType = typeof KEYWORDS[number];
