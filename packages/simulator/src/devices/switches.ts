import { Byte } from "@vonsim/common/byte";
import type { JsonValue } from "type-fest";

import { Component, ComponentReset } from "../component";
import type { EventGenerator } from "../events";

export type SwitchesEvent = { type: "toggle"; index: number };

export class Switches extends Component {
  #connected = false;
  #state = Byte.zero(8);

  reset({ memory, devices }: ComponentReset): void {
    this.#connected = devices === "pio-switches-and-leds";
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
   * Toggles the switch at the given index. Called by the outside.
   */
  *toggle(index: number): EventGenerator {
    if (!this.#connected) return;

    if (this.#state.bit(index)) this.#state = this.#state.clearBit(index);
    else this.#state = this.#state.setBit(index);
    yield { component: "switches", type: "toggle", index };

    yield* this.computer.io.pio!.updatePort("A");
  }

  toJSON(): JsonValue {
    return this.#state.toJSON();
  }
}
