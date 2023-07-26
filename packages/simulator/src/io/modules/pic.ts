import type { IOAddressLike } from "@vonsim/common/address";
import { Byte, ByteSize } from "@vonsim/common/byte";
import type { JsonObject } from "type-fest";

import type { ComponentInit } from "../../component";
import type { EventGenerator } from "../../events";
import { IOModule } from "../module";

type InterruptLine = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
type PICRegister = "EOI" | "IMR" | "IRR" | "ISR" | `INT${InterruptLine}`;

export type PICOperation =
  | { type: "pic:read"; register: PICRegister }
  | { type: "pic:read.ok"; value: Byte<8> }
  | { type: "pic:write"; register: PICRegister; value: Byte<8> }
  | { type: "pic:write.ok" }
  | { type: "pic:register.update"; register: Omit<PICRegister, "EOI">; value: Byte<8> }
  | { type: "pic:intr.on" }
  | { type: "pic:intr.off" }
  | { type: "pic:int.send"; number: Byte<8> };

/**
 * The Programmable Interrupt Controller (PIC) is a module that handles interrupts.
 *
 * Reserved addresses:
 * - 20h: EOI
 * - 21h: IMR
 * - 22h: IRR
 * - 23h: ISR
 * - 24h to 2Bh: INT0 to INT7
 *
 * @see {@link https://vonsim.github.io/docs/io/modules/pic/}.
 *
 * ---
 * This class is: MUTABLE
 */
export class PIC extends IOModule<PICRegister> {
  static readonly LINES = 8 satisfies ByteSize;

  #IMR: Byte<8>;
  #IRR: Byte<8>;
  #ISR: Byte<8>;
  #lines: Byte<8>[];

  constructor(options: ComponentInit) {
    super(options);
    this.#IMR = Byte.fromUnsigned(0xff, 8);
    this.#IRR = Byte.fromUnsigned(0x00, 8);
    this.#ISR = Byte.fromUnsigned(0x00, 8);

    if (options.data === "unchanged") {
      this.#lines = options.previous.io.pic.#lines;
    } else if (options.data === "randomize") {
      this.#lines = new Array(PIC.LINES).fill(Byte.zero(8)).map(() => Byte.random(8));
    } else {
      this.#lines = new Array(PIC.LINES).fill(Byte.zero(8));
    }
  }

  /**
   * Returns the highest priority non-masked requested interrupt,
   * or null if no interrupt is pending.
   */
  #getPending(): InterruptLine | null {
    // Get highest priority interrupt, being the least significant bit the highest.
    for (let i = 0; i < PIC.LINES; i++) {
      // Interrupt is pending and not masked
      if (this.#IRR.bit(i) && !this.#IMR.bit(i)) {
        return i as InterruptLine;
      }
    }
    return null;
  }

  /**
   * Updates the INTR line if needed.
   */
  *#updateINTR(): EventGenerator {
    if (!this.#ISR.isZero()) return;
    // If the ISR is zero, no interrupt is being handled.
    if (this.#getPending() !== null) {
      // There is a pending interrupt -> turn on the INTR line
      yield { type: "pic:intr.on" };
    }
  }

  chipSelect(address: IOAddressLike): PICRegister | null {
    const start = 0x20; // PIC address space start at 20h
    const length = 4 + PIC.LINES; // EOI, IMR, IRR, ISR + interrupt lines

    address = Number(address) - start;
    if (address < 0 || address >= length) return null;

    if (address === 0) return "EOI";
    else if (address === 1) return "IMR";
    else if (address === 2) return "IRR";
    else if (address === 3) return "ISR";
    else return `INT${address - 4}` as PICRegister;
  }

  *read(register: PICRegister): EventGenerator<Byte<8>> {
    yield { type: "pic:read", register };

    let value: Byte<8>;
    if (register === "EOI") value = Byte.zero(8);
    else if (register === "IMR") value = this.#IMR;
    else if (register === "IRR") value = this.#IRR;
    else if (register === "ISR") value = this.#ISR;
    else {
      const line = Number(register.slice(3));
      value = this.#lines[line];
    }

    yield { type: "pic:read.ok", value };
    return value;
  }

  *write(register: PICRegister, value: Byte<8>): EventGenerator {
    yield { type: "pic:write", register, value };

    if (register === "EOI") {
      if (!this.#ISR.isZero()) {
        // If the ISR is not zero, an interrupt is being handled.
        // Also, the INTR line is active.
        yield { type: "pic:intr.off" };

        this.#ISR = Byte.zero(8);
        yield { type: "pic:register.update", register: "ISR", value: this.#ISR };
        yield* this.#updateINTR();
      }
    } else if (register === "IMR") {
      this.#IMR = value;
      yield { type: "pic:register.update", register: "IMR", value: this.#IMR };
      yield* this.#updateINTR();
    } else if (register === "IRR" || register === "ISR") {
      // Do nothing -- these registers are read-only
    } else {
      const line = Number(register.slice(3));
      this.#lines[line] = value;
      yield { type: "pic:register.update", register, value };
    }

    yield { type: "pic:write.ok" };
  }

  /**
   * Sends an interrupt to the PIC.
   * @param line Which line the device is connected to.
   *
   * ---
   * Called by any device that wants to send an interrupt.
   */
  *interrupt(line: InterruptLine): EventGenerator {
    if (line < 0 || line >= PIC.LINES) {
      throw new RangeError(`Invalid interrupt line ${line}`);
    }

    // Interrupt already requested
    if (this.#IRR.bit(line)) return;

    this.#IRR = this.#IRR.withBit(line, true);
    yield { type: "pic:register.update", register: "IRR", value: this.#IRR };
    yield* this.#updateINTR();
  }

  /**
   * Checks if the INTR line is active.
   * @returns Whether the INTR line is active.
   *
   * ---
   * Called by the CPU.
   */
  isINTRActive(): boolean {
    return !this.#ISR.isZero() || this.#getPending() !== null;
  }

  /**
   * Handles requested interrupt.
   * This method handles the INTR / INTA handshake,
   * starting from (and including) the first INTA signal.
   * @returns The interrupt number (8-bits).
   *
   * ---
   * Called by the CPU.
   */
  *handleINTR(): EventGenerator<Byte<8>> {
    yield { type: "cpu:inta.on" };

    if (!this.#ISR.isZero()) {
      // If the ISR is not zero, an interrupt is being handled.
      throw new Error("INTR line is active but ISR is not zero");
    }

    const pending = this.#getPending();
    if (pending === null) {
      // No interrupt is pending
      throw new Error("INTR line is active but no interrupt is pending");
    }

    // Update ISR and IRR
    this.#IRR = this.#IRR.withBit(pending, false);
    yield { type: "pic:register.update", register: "IRR", value: this.#IRR };
    this.#ISR = this.#ISR.withBit(pending, true);
    yield { type: "pic:register.update", register: "ISR", value: this.#ISR };

    yield { type: "cpu:inta.off" };

    // Send interrupt number
    yield { type: "cpu:inta.on" };
    const number = this.#lines[pending];
    yield { type: "pic:int.send", number };
    yield { type: "cpu:inta.off" };
    return number;
  }

  toJSON() {
    return {
      IMR: this.#IMR.toJSON(),
      IRR: this.#IRR.toJSON(),
      ISR: this.#ISR.toJSON(),
      lines: this.#lines.map(line => line.toJSON()),
    } satisfies JsonObject;
  }
}
