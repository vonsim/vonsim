import { Byte } from "@vonsim/common/byte";
import type { JsonValue } from "type-fest";

import { Component, ComponentInit } from "../../component";
import type { EventGenerator } from "../../events";

export type SwitchesEvent = { type: "switches:toggle"; index: number };

export class Switches extends Component {
  #state: Byte<8>;

  constructor(options: ComponentInit) {
    super(options);
    if (options.data === "unchanged" && "switches" in options.previous.io) {
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
   * Toggles the switch at the given index. Called by the outside.
   */
  *toggle(index: number): EventGenerator {
    if (!("pio" in this.computer.io)) return;

    if (this.#state.bit(index)) this.#state = this.#state.clearBit(index);
    else this.#state = this.#state.setBit(index);
    yield { type: "switches:toggle", index };

    yield* this.computer.io.pio.updatePort("A");
  }

  toJSON(): JsonValue {
    return this.#state.toJSON();
  }
}
