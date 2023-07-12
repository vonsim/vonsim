import { Byte } from "@vonsim/common/byte";
import type { JsonValue } from "type-fest";

import { Component, ComponentInit } from "../../../component";
import type { EventGenerator } from "../../../events";

export type LedsEvent = { type: "leds:update"; state: Byte<8> };

export class Leds extends Component<"pio-switches-and-leds"> {
  #state: Byte<8>;

  constructor(options: ComponentInit<"pio-switches-and-leds">) {
    super(options);
    if (options.data === "unchanged" && "leds" in options.previous.io) {
      this.#state = options.previous.io.leds.#state;
    } else if (options.data === "randomize") {
      this.#state = Byte.random(8);
    } else {
      this.#state = Byte.zero(8);
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

  toJSON() {
    return this.#state.toJSON() satisfies JsonValue;
  }
}
