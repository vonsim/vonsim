import type { Position } from "@/position";

import { Statement } from ".";

export class EndStatement extends Statement {
  readonly type = "end";

  constructor(position: Position) {
    super(position);
  }
}
