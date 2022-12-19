import { P } from "ts-pattern";
import {
  byteRegisterPattern,
  dataDirectivePattern,
  instructionPattern,
  keywordPattern,
  registerPattern,
  wordRegisterPattern,
} from "./patterns";

export type RegisterType = P.infer<typeof registerPattern>;
export type ByteRegisterType = P.infer<typeof byteRegisterPattern>;
export type WordRegisterType = P.infer<typeof wordRegisterPattern>;

export type DataDirectiveType = P.infer<typeof dataDirectivePattern>;
export type InstructionType = P.infer<typeof instructionPattern>;

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
