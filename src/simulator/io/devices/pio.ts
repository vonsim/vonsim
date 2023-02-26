import { None, Option, Some } from "rust-optionals";
import { match } from "ts-pattern";

import { bit, randomByte } from "@/helpers";
import type { IORegisters, MemoryMode } from "@/simulator/common";

export type PIOOptions = { mode: MemoryMode };

/**
 * @see /docs/como-usar/dispositivos/pio.md for more details
 */
export class PIO implements IORegisters {
  static readonly PA = 0x30;
  static readonly PB = 0x31;
  static readonly CA = 0x32;
  static readonly CB = 0x33;

  #PA = 0x00;
  #PB = 0x00;
  #CA = 0x00;
  #CB = 0x00;

  reset({ mode }: PIOOptions) {
    if (mode === "empty") {
      this.#PA = 0x00;
      this.#PB = 0x00;
      this.#CA = 0x00;
      this.#CB = 0x00;
    } else if (mode === "randomize") {
      this.#PA = randomByte();
      this.#PB = randomByte();
      this.#CA = randomByte();
      this.#CB = randomByte();
    }
  }

  getRegister(address: number): Option<number> {
    return match(address)
      .with(PIO.PA, () => Some(this.#PA))
      .with(PIO.PB, () => Some(this.#PB))
      .with(PIO.CA, () => Some(this.#CA))
      .with(PIO.CB, () => Some(this.#CB))
      .otherwise(() => None());
  }

  setRegister(address: number, value: number): Option<void> {
    return match(address)
      .with(PIO.PA, () => Some(void (this.#PA = value)))
      .with(PIO.PB, () => Some(void (this.#PB = value)))
      .with(PIO.CA, () => Some(void (this.#CA = value)))
      .with(PIO.CB, () => Some(void (this.#CB = value)))
      .otherwise(() => None());
  }

  bitMode(port: "A" | "B", index: number) {
    const controlByte = port === "A" ? this.#CA : this.#CB;
    return bit(controlByte, index) ? "input" : "output";
  }

  toJSON() {
    return { PA: this.#PA, PB: this.#PB, CA: this.#CA, CB: this.#CB };
  }
}
