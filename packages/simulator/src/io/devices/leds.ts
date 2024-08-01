import { Byte } from "@vonsim/common/byte";
import type { JsonValue } from "type-fest";

import { Component, ComponentInit } from "../../component";
import type { EventGenerator } from "../../events";

export type LedsEvent = { type: "leds:update"; state: Byte<8> };

/**
 * Led lights. These are only modified by the PIO, not the user.
 *
 * @see {@link https://vonsim.github.io/en/io/devices/switches-and-leds}.
 *
 * ---
 * This class is: MUTABLE
 */
export abstract class Leds extends Component {
  #state: Byte<8>;

  constructor(options: ComponentInit) {
    super(options);
    if (options.data === "unchanged" && options.previous.io.leds) {
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
   * Updates the state of the Leds.
   *
   * ---
   * Called by the PIO.
   */
  *update(state: Byte<8>): EventGenerator {
    yield { type: "leds:update", state };
  }

  toJSON() {
    return this.#state.toJSON() satisfies JsonValue;
  }
}
