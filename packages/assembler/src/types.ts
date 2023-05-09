import type { TupleToUnion } from "type-fest";

// #=========================================================================#
// # Registers                                                               #
// #=========================================================================#

export const BYTE_REGISTERS = ["AL", "BL", "CL", "DL", "AH", "BH", "CH", "DH"] as const;
export type ByteRegisterName = TupleToUnion<typeof BYTE_REGISTERS>;

export const WORD_REGISTERS = ["AX", "BX", "CX", "DX", "SP"] as const;
export type WordRegisterName = TupleToUnion<typeof WORD_REGISTERS>;

export const REGISTERS = [...BYTE_REGISTERS, ...WORD_REGISTERS] as const;
export type RegisterName = TupleToUnion<typeof REGISTERS>;

// #=========================================================================#
// # Data directives                                                         #
// #=========================================================================#

export const DATA_DIRECTIVES = ["DB", "DW"] as const;
export type DataDirectiveName = TupleToUnion<typeof DATA_DIRECTIVES>;

export const CONSTANTS = ["EQU"] as const;
export type ConstantName = TupleToUnion<typeof CONSTANTS>;

// #=========================================================================#
// # Instructions                                                            #
// #=========================================================================#

export const INSTRUCTIONS = [
  // Data transfer
  "MOV",
  "PUSH",
  "POP",
  "IN",
  "OUT",
  "PUSHF",
  "POPF",
  // Arithmetic
  "ADD",
  "ADC",
  "INC",
  "SUB",
  "SBB",
  "DEC",
  "NEG",
  "CMP",
  // Logic
  "NOT",
  "AND",
  "OR",
  "XOR",
  // Control transfer
  "CALL",
  "JMP",
  "RET",
  "JZ",
  "JO",
  "JS",
  "JC",
  "JNZ",
  "JNO",
  "JNS",
  "JNC",
  "INT",
  "IRET",
  // Processor control
  "CLI",
  "STI",
  "NOP",
  "HLT",
] as const;
export type InstructionName = TupleToUnion<typeof INSTRUCTIONS>;

// #=========================================================================#
// # Keywords                                                                #
// #=========================================================================#

export const KEYWORDS = [
  "OFFSET",
  "ORG",
  "BYTE",
  "WORD",
  "PTR",
  "END",
  ...REGISTERS,
  ...INSTRUCTIONS,
  ...DATA_DIRECTIVES,
  ...CONSTANTS,
] as const;
export type Keyword = TupleToUnion<typeof KEYWORDS>;
