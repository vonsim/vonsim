import { bit, byteArray } from "@/helpers";
import type { Jsonable } from "@/simulator/common";

import { PIO } from "./pio";

/**
 * @see /docs/como-usar/dispositivos/teclas-y-leds.md for more details
 */
export class Leds implements Jsonable {
  #pio: PIO;
  #state = byteArray(() => false);

  constructor(pio: PIO) {
    this.#pio = pio;
  }

  reset() {
    this.syncPIO();
  }

  syncPIO() {
    // Update LEDs
    const PB = this.#pio.getRegister(PIO.PB).unwrap();

    for (let i = 0; i < 8; i++) {
      if (this.#pio.bitMode("B", i) === "output") {
        const on = bit(PB, i);
        this.#state[i] = on;
      } else {
        // If the PIO is configured as an input, then the LED
        // should be off
        this.#state[i] = false;
      }
    }
  }

  toJSON() {
    return structuredClone(this.#state);
  }
}
