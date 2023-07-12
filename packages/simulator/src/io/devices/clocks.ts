import { Component } from "../../component";
import type { EventGenerator } from "../../events";

export type ClockEvent = { type: "clock:tick" };

export class Clock extends Component {
  *tick(): EventGenerator {
    yield { type: "clock:tick" };
    yield* this.computer.io.timer.tick();
  }

  toJSON() {
    return null;
  }
}
