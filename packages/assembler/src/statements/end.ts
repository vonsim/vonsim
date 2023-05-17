import type { Position } from "../position";
import { Statement } from "./statement";

export class EndStatement extends Statement {
  readonly type = "end";

  constructor(position: Position) {
    super(position);
  }
}
