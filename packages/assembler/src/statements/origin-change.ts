import type { Position } from "@/position";

import { Statement } from "./statement";

export class OriginChangeStatement extends Statement {
  readonly type = "origin-change";

  constructor(readonly newAddress: number, position: Position) {
    super(position);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      newAddress: this.newAddress,
    };
  }
}
