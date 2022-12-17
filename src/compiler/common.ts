import { Token } from "./lexer/tokens";

export type Position = [line: number, column: number];
export type PositionRange = [from: Position, to: Position];

export class CompilerError extends Error {
  constructor(message: string, public readonly from: Position, public readonly to: Position) {
    super(message);
  }

  static fromToken(message: string, token: Token) {
    return new CompilerError(message, token.position, [
      token.position[0],
      token.position[1] + token.lexeme.length,
    ]);
  }

  static fromPositionRange(message: string, [from, to]: PositionRange) {
    return new CompilerError(message, from, to);
  }

  toString() {
    return `${this.message} (${this.from.join(",")} - ${this.to.join(",")})`;
  }
}

// This is a TypeScript hack for when you want to use Array.includes() to check
// if an element is in a collection, but you also want to narrow the type of
// the element to the type of the collection.
export function includes<T extends U, U>(coll: ReadonlyArray<T>, el: U): el is T {
  return coll.includes(el as T);
}
