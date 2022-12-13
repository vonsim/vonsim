import type { Position } from "../common";

export class Token {
  // TypeScript's Parameter Properties
  // https://www.typescriptlang.org/docs/handbook/2/classes.html#parameter-properties
  constructor(
    public readonly type: TokenType,
    public readonly lexeme: string,
    public readonly position: Position,
  ) {}

  toString() {
    return `${this.type} '${this.lexeme}' ${this.position}`;
  }
}

export type TokenType =
  // Single-character tokens.
  | "LEFT_BRACKET"
  | "RIGHT_BRACKET"
  | "COMMA"
  | "COLON"
  | "PLUS"
  | "MINUS"
  // Literals.
  | "IDENTIFIER"
  | "STRING"
  | "NUMBER"
  // Keywords.
  | typeof KEYWORDS[number]
  // ...
  | "EOL"
  | "EOF";

const INSTRUCTIONS = [
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

export const KEYWORDS = ["OFFSET", "ORG", "DB", "DW", "EQU", "END", ...INSTRUCTIONS] as const;
