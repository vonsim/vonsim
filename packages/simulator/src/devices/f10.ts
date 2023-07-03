import type { JsonValue } from "type-fest";

import { Component } from "../component";
import type { EventGenerator } from "../events";

export type F10Event = { type: "f10:press" };

export class F10 extends Component {
  *press(): EventGenerator {
    yield { type: "f10:press" };
    yield* this.computer.io.pic.interrupt(0);
  }

  reset(): void {
    // Nothing to do here
  }

  toJSON(): JsonValue {
    return null;
  }
}
