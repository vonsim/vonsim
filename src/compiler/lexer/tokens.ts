import type { Position } from "../common";

export type Token = {
  type: TokenType;
  lexeme: string;
  position: Position;
};

export type TokenType =
  // Single-character tokens.
  | "LEFT_PAREN"
  | "RIGHT_PAREN"
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

export const DATA_DIRECTIVES = ["DB", "DW", "EQU"] as const;

export type DataDirectiveType = typeof DATA_DIRECTIVES[number];

export const REGISTERS = [
  "AX",
  "BX",
  "CX",
  "DX",
  "AL",
  "BL",
  "CL",
  "DL",
  "AH",
  "BH",
  "CH",
  "DH",
  "IP",
  "SP",
  "IR",
  "MAR",
  "MBR",
] as const;

export type RegisterType = typeof REGISTERS[number];

export const KEYWORDS = [
  "OFFSET",
  "ORG",
  "BYTE",
  "WORD",
  "PTR",
  "END",
  ...DATA_DIRECTIVES,
  ...REGISTERS,
  ...INSTRUCTIONS,
] as const;

export type KeywordType = typeof KEYWORDS[number];
