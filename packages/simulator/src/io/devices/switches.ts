import { Byte } from "@vonsim/common/byte";
import type { JsonValue } from "type-fest";

import { Component, ComponentInit } from "../../component";
import type { EventGenerator } from "../../events";

export type SwitchesEvent = { type: "switches:toggle"; index: number };

/**
 * Switches. These are only modified by the user, not the PIO.
 *
 * @see {@link https://vonsim.github.io/docs/io/devices/switches-and-leds/}.
 *
 * ---
 * This class is: MUTABLE
 */
export abstract class Switches extends Component {
  #state: Byte<8>;

  constructor(options: ComponentInit) {
    super(options);
    if (options.data === "unchanged" && options.previous.io.switches) {
      this.#state = options.previous.io.switches.#state;
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
   * Toggles the switch at the given index.
   *
   * ---
   * Called by the outside when the user clicks on a switch.
   */
  *toggle(index: number): EventGenerator {
    this.#state = this.#state.withBit(index, !this.#state.bit(index));
    yield { type: "switches:toggle", index };
  }

  toJSON() {
    return this.#state.toJSON() satisfies JsonValue;
  }
}
