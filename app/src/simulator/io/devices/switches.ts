import { byteArray } from "@/helpers";
import type { Jsonable, MemoryMode } from "@/simulator/common";

import { PIO } from "./pio";

export type SwitchesOptions = { mode: MemoryMode };

/**
 * @see /docs/como-usar/dispositivos/teclas-y-leds.md for more details
 */
export class Switches implements Jsonable {
  #pio: PIO;
  #state = byteArray(() => false);

  constructor(pio: PIO) {
    this.#pio = pio;
  }

  reset({ mode }: SwitchesOptions) {
    if (mode === "empty") this.#state = byteArray(() => false);
    else if (mode === "randomize") this.#state = byteArray(() => Math.random() < 0.5);
    this.syncPIO();
  }

  toggle(index: number) {
    const on = !this.#state[index];
    this.#state[index] = on;

    if (this.#pio.bitMode("A", index) === "input") {
      let PA = this.#pio.getRegister(PIO.PA).unwrap();
      if (on) PA |= 1 << index;
      else PA &= ~(1 << index);
      this.#pio.setRegister(PIO.PA, PA);
    }
  }

  syncPIO() {
    // Overwrite PA with the state of the switches
    let PA = this.#pio.getRegister(PIO.PA).unwrap();
    for (let i = 0; i < 8; i++) {
      if (this.#pio.bitMode("A", i) === "input") {
        if (this.#state[i]) PA |= 1 << i;
        else PA &= ~(1 << i);
      }
    }
    this.#pio.setRegister(PIO.PA, PA);

    // Note: never update switches themselves
    // For the viewpoint of the PIO, the switches are always inputs
  }

  toJSON() {
    return structuredClone(this.#state);
  }
}
