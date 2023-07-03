import { Byte } from "@vonsim/common/byte";
import type { JsonValue } from "type-fest";

import { Component, ComponentReset } from "../component";
import type { EventGenerator } from "../events";

export type LedsEvent = { type: "leds:update"; state: Byte<8> };

export class Leds extends Component {
  #state = Byte.zero(8);

  reset({ memory }: ComponentReset): void {
    if (memory === "clean") {
      this.#state = Byte.zero(8);
    } else if (memory === "randomize") {
      this.#state = Byte.random(8);
    }
  }

  get state() {
    return this.#state;
  }

  /**
   * Updates the state of the Leds. Called by the PIO.
   */
  *update(state: Byte<8>): EventGenerator {
    yield { type: "leds:update", state };
  }

  toJSON(): JsonValue {
    return this.#state.toJSON();
  }
}
