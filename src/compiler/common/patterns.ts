import { P } from "ts-pattern";

// #=========================================================================#
// # Registers                                                               #
// #=========================================================================#

const generalPurposeByteRegisterPattern = P.union(
  "AL" as const,
  "BL" as const,
  "CL" as const,
  "DL" as const,
  "AH" as const,
  "BH" as const,
  "CH" as const,
  "DH" as const,
);

const generalPurposeWordRegisterPattern = P.union(
  "AX" as const,
  "BX" as const,
  "CX" as const,
  "DX" as const,
);

const generalPurposeRegisterPattern = P.union(
  generalPurposeByteRegisterPattern,
  generalPurposeWordRegisterPattern,
);

const specialPurposeRegisterPattern = P.union(
  "IP" as const,
  "SP" as const,
  "IR" as const,
  "MAR" as const,
  "MBR" as const,
);

export const registerPattern = P.union(
  generalPurposeRegisterPattern,
  specialPurposeRegisterPattern,
);

export const byteRegisterPattern = generalPurposeByteRegisterPattern;

export const wordRegisterPattern = P.union(
  generalPurposeWordRegisterPattern,
  specialPurposeRegisterPattern,
);

// #=========================================================================#
// # Data directives                                                         #
// #=========================================================================#

export const dataDirectivePattern = P.union("DB" as const, "DW" as const, "EQU" as const);

// #=========================================================================#
// # Instructions                                                            #
// #=========================================================================#

// To see why these instructions are split into two groups,
// see /docs/especificaciones/codificacion.md

export const zeroaryInstructionPattern = P.union(
  "PUSHF" as const,
  "POPF" as const,
  "RET" as const,
  "IRET" as const,
  "CLI" as const,
  "STI" as const,
  "NOP" as const,
  "HLT" as const,
);

export const binaryInstructionPattern = P.union(
  "MOV" as const,
  "ADD" as const,
  "ADC" as const,
  "SUB" as const,
  "SBB" as const,
  "CMP" as const,
  "AND" as const,
  "OR" as const,
  "XOR" as const,
);

export const unaryInstructionPattern = P.union(
  "NEG" as const,
  "INC" as const,
  "DEC" as const,
  "NOT" as const,
);

export const stackInstructionPattern = P.union("PUSH" as const, "POP" as const);

export const jumpInstructionPattern = P.union(
  "CALL" as const,
  "JZ" as const,
  "JNZ" as const,
  "JS" as const,
  "JNS" as const,
  "JC" as const,
  "JNC" as const,
  "JO" as const,
  "JNO" as const,
  "JMP" as const,
);

export const ioInstructionPattern = P.union("IN" as const, "OUT" as const);

export const intInstructionPattern = "INT" as const;

export const instructionPattern = P.union(
  zeroaryInstructionPattern,
  binaryInstructionPattern,
  unaryInstructionPattern,
  stackInstructionPattern,
  jumpInstructionPattern,
  ioInstructionPattern,
  intInstructionPattern,
);

// #=========================================================================#
// # Keywords                                                                #
// #=========================================================================#

export const keywordPattern = P.union(
  "OFFSET" as const,
  "ORG" as const,
  "BYTE" as const,
  "WORD" as const,
  "PTR" as const,
  registerPattern,
  instructionPattern,
  dataDirectivePattern,
);
