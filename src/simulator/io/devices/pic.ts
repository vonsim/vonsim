import { None, Option, Some } from "rust-optionals";
import { match } from "ts-pattern";

import { bit, byteArray, randomByte } from "@/helpers";
import type { IORegisters, MemoryMode } from "@/simulator/common";

export type PICOptions = { mode: MemoryMode };

/**
 * @see /docs/como-usar/dispositivos/pic.md for more details
 */
export class PIC implements IORegisters {
  static readonly EOI = 0x20;
  static readonly IMR = 0x21;
  static readonly IRR = 0x22;
  static readonly ISR = 0x23;
  static readonly INT0 = 0x24;
  static readonly INT7 = 0x2b;

  #EOI = 0b0000_0000;
  #IMR = 0b1111_1111;
  #IRR = 0b0000_0000;
  #ISR = 0b0000_0000;

  // From INT0 to INT7
  #connections = [0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17];

  reset({ mode }: PICOptions) {
    this.#EOI = 0b0000_0000;
    this.#IMR = 0b1111_1111;
    this.#IRR = 0b0000_0000;
    this.#ISR = 0b0000_0000;

    if (mode === "empty") {
      this.#connections = [0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17];
    } else if (mode === "randomize") {
      this.#connections = byteArray(randomByte);
    }
  }

  getRegister(address: number): Option<number> {
    if (address >= PIC.INT0 && address <= PIC.INT7) {
      return Some(this.#connections[address - PIC.INT0]);
    }

    return match(address)
      .with(PIC.EOI, () => Some(this.#EOI))
      .with(PIC.IMR, () => Some(this.#IMR))
      .with(PIC.IRR, () => Some(this.#IRR))
      .with(PIC.ISR, () => Some(this.#ISR))
      .otherwise(() => None());
  }

  setRegister(address: number, value: number): Option<void> {
    if (address === PIC.EOI) {
      // Don't update EOI

      if (value === 0x20) {
        // End of interrupt
        this.#ISR = 0b0000_0000;
      }

      return Some(undefined);
    }

    if (address === PIC.IMR) {
      this.#IMR = value;
      return Some(undefined);
    }

    if (address === PIC.IRR || address === PIC.ISR) {
      // Don't update IRR or ISR
      return Some(undefined);
    }

    if (address >= PIC.INT0 && address <= PIC.INT7) {
      this.#connections[address - PIC.INT0] = value;
      return Some(undefined);
    }

    return None();
  }

  request(n: number) {
    const mask = 1 << n;
    this.#IRR |= mask;
  }

  cancel(n: number) {
    const mask = 1 << n;
    this.#IRR &= ~mask;
  }

  /**
   * Checks if there is an interrupt to be executed.
   * If so, puts it into the ISR and returns the interrupt ID N.
   */
  handleNextInterrupt(): Option<number> {
    if (this.#ISR !== 0) {
      // There is an interrupt being executed
      return None();
    }

    const masked = this.#IRR & ~this.#IMR;
    for (let i = 0; i < 8; i++) {
      if (bit(masked, i)) {
        const id = this.#connections[i];
        this.#IRR &= ~(1 << i);
        this.#ISR = 1 << i;
        return Some(id);
      }
    }

    return None();
  }

  toJSON() {
    return {
      EOI: this.#EOI,
      IMR: this.#IMR,
      IRR: this.#IRR,
      ISR: this.#ISR,
      INT0: this.#connections[0],
      INT1: this.#connections[1],
      INT2: this.#connections[2],
      INT3: this.#connections[3],
      INT4: this.#connections[4],
      INT5: this.#connections[5],
      INT6: this.#connections[6],
      INT7: this.#connections[7],
    };
  }
}
