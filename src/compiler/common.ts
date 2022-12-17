import { Token } from "./lexer/tokens";

/** A number representing a position in the source code, counting from the beginning. */
export type Position = number;

/**
 * A range of positions in the source code, represented as a tuple of two positions.
 *
 * @see {@link Position}
 */
export type PositionRange = [from: Position, to: Position];

export class CompilerError extends Error {
  constructor(message: string, public readonly from: Position, public readonly to: Position) {
    super(message);
  }

  static fromToken(message: string, token: Token) {
    return new CompilerError(message, token.position, token.position + token.lexeme.length);
  }

  static fromPositionRange(message: string, [from, to]: PositionRange) {
    return new CompilerError(message, from, to);
  }

  toString() {
    return `${this.message} (${this.from} - ${this.to})`;
  }
}

/**
 * This is a TypeScript hack for when you want to use Array.includes() to check
 * if an element is in a collection, but you also want to narrow the type of
 * the element to the type of the collection.
 *
 * @param coll collection to search
 * @param el element to search for
 */
export function includes<T extends U, U>(coll: ReadonlyArray<T>, el: U): el is T {
  return coll.includes(el as T);
}
