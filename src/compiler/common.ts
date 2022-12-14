export type Position = [line: number, column: number];

export class CompilerError extends Error {
  constructor(message: string, public readonly from: Position, public readonly to: Position) {
    super(message);
  }

  toString() {
    return `${this.message} (${this.from.join(",")} - ${this.to.join(",")})`;
  }
}
