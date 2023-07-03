import type { JsonValue } from "type-fest";

import { Component } from "../component";
import type { EventGenerator } from "../events";

export type ClockEvent = { type: "tick" };

export class Clock extends Component {
  *tick(): EventGenerator {
    yield { component: "clock", type: "tick" };
    yield* this.computer.io.timer.tick();
  }

  reset(): void {
    // Nothing to do here
  }

  toJSON(): JsonValue {
    return null;
  }
}
