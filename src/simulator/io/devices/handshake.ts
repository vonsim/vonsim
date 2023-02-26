import { None, Option, Some } from "rust-optionals";
import { match } from "ts-pattern";

import { bit } from "@/helpers";
import type { IORegisters } from "@/simulator/common";

import type { Printer } from "./printer";

/**
 * @see /docs/como-usar/dispositivos/handshake.md for more details
 */
export class Handshake implements IORegisters {
  static readonly DATA = 0x40;
  static readonly STATE = 0x41;

  #data = 0x00;
  #state = 0x00; // IXXX XXSB, where I is interrupt, S is strobe, B is busy

  #printer: Printer;

  constructor(printer: Printer) {
    this.#printer = printer;
  }

  reset() {
    this.#data = 0x00;
    this.#state = 0x00;
  }

  getRegister(address: number): Option<number> {
    return match(address)
      .with(Handshake.DATA, () => Some(this.#data))
      .with(Handshake.STATE, () => Some(this.#state))
      .otherwise(() => None());
  }

  setRegister(address: number, value: number): Option<void> {
    if (address === Handshake.DATA) {
      this.#data = value;
      this.#printer.addToBuffer(this.#data);
      return Some(undefined);
    }

    if (address === Handshake.STATE) {
      // Check for strobe. That bit will always be 0,
      // so we only need to check if the new value has a 1.

      if (bit(value, 1)) {
        value &= ~0b10; // Clear strobe bit
        this.#printer.addToBuffer(this.#data);
      }

      this.#state = value;
      return Some(undefined);
    }

    return None();
  }

  get interrupts() {
    return bit(this.#state, 7);
  }

  toJSON() {
    return { data: this.#data, state: this.#state };
  }
}
