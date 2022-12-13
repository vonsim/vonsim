export class Position {
  constructor(public readonly line: number, public readonly column: number) {}

  forward() {
    return new Position(this.line, this.column + 1);
  }

  down() {
    return new Position(this.line + 1, 1);
  }

  clone() {
    return new Position(this.line, this.column);
  }

  toString() {
    return `${this.line},${this.column}`;
  }
}

export class CompilerError extends Error {
  constructor(message: string, public readonly from: Position, public readonly to: Position) {
    super(message);
  }

  toString() {
    return `${this.message} (${this.from} - ${this.to})`;
  }
}
