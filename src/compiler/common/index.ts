import type { P } from "ts-pattern";
import type {
  binaryInstructionPattern,
  byteRegisterPattern,
  dataDirectivePattern,
  instructionPattern,
  intInstructionPattern,
  ioInstructionPattern,
  jumpInstructionPattern,
  keywordPattern,
  physicalRegisterPattern,
  registerPattern,
  stackInstructionPattern,
  unaryInstructionPattern,
  wordRegisterPattern,
  zeroaryInstructionPattern,
} from "./patterns";

export type RegisterType = P.infer<typeof registerPattern>;
export type ByteRegisterType = P.infer<typeof byteRegisterPattern>;
export type WordRegisterType = P.infer<typeof wordRegisterPattern>;
export type PhysicalRegisterType = P.infer<typeof physicalRegisterPattern>;

export type DataDirectiveType = P.infer<typeof dataDirectivePattern>;
export type InstructionType = P.infer<typeof instructionPattern>;

export type ZeroaryInstructionType = P.infer<typeof zeroaryInstructionPattern>;
export type BinaryInstructionType = P.infer<typeof binaryInstructionPattern>;
export type UnaryInstructionType = P.infer<typeof unaryInstructionPattern>;
export type StackInstructionType = P.infer<typeof stackInstructionPattern>;
export type JumpInstructionType = P.infer<typeof jumpInstructionPattern>;
export type IOInstructionType = P.infer<typeof ioInstructionPattern>;
export type IntInstructionType = P.infer<typeof intInstructionPattern>;

export type KeywordType = P.infer<typeof keywordPattern>;

/** A number representing a position in the source code, counting from the beginning. */
export type Position = number;

/**
 * A range of positions in the source code, represented as a tuple of two positions.
 *
 * @see {@link Position}
 */
export type PositionRange = [from: Position, to: Position];

export { CompilerError } from "./error";
export * from "./helpers";
