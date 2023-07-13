import type { IOAddressLike } from "@vonsim/common/address";
import { Byte } from "@vonsim/common/byte";
import type { JsonObject } from "type-fest";

import type { ComponentInit } from "../../../component";
import type { EventGenerator } from "../../../events";
import { IOModule } from "../../module";

type HandshakeRegister = "DATA" | "STATE";

export type HandshakeOperation =
  | { type: "handshake:read"; register: HandshakeRegister }
  | { type: "handshake:read.ok"; value: Byte<8> }
  | { type: "handshake:write"; register: HandshakeRegister; value: Byte<8> }
  | { type: "handshake:write.ok" }
  | { type: "handshake:register.update"; register: HandshakeRegister; value: Byte<8> }
  | { type: "handshake:interrupt" };

export class Handshake extends IOModule<HandshakeRegister, "handshake"> {
  #DATA: Byte<8>;
  #STATE: Byte<8>;

  constructor(options: ComponentInit<"handshake">) {
    super(options);
    if (options.data === "unchanged" && "handshake" in options.previous.io) {
      this.#DATA = Byte.zero(8);
    } else if (options.data === "randomize") {
      this.#DATA = Byte.random(8);
    } else {
      this.#DATA = Byte.zero(8);
    }
    this.#STATE = Byte.zero(8);
  }

  /**
   * @returns Whether the interrupt is enabled or not (boolean).
   * @see /docs/como-usar/dispositivos/handshake.md
   */
  get interrupts(): boolean {
    return this.#STATE.bit(7);
  }

  /**
   * @returns The value of the DATA register. Consumed by the printer.
   */
  get DATA(): Byte<8> {
    return this.#DATA;
  }

  chipSelect(address: IOAddressLike): HandshakeRegister | null {
    address = Number(address);
    if (address === 0x40) return "DATA";
    else if (address === 0x41) return "STATE";
    else return null;
  }

  *read(register: HandshakeRegister): EventGenerator<Byte<8>> {
    yield { type: "handshake:read", register };

    let value: Byte<8>;
    if (register === "DATA") value = this.#DATA;
    else if (register === "STATE") value = this.#STATE;
    else return register; // Exhaustive check

    yield { type: "handshake:read.ok", value };
    return value;
  }

  *write(register: HandshakeRegister, value: Byte<8>): EventGenerator {
    yield { type: "handshake:write", register, value };

    if (register === "DATA") {
      this.#DATA = value;
      yield { type: "handshake:register.update", register, value };
      yield* this.computer.io.printer.setStrobe(true);
      yield* this.computer.io.printer.setStrobe(false);
    } else if (register === "STATE") {
      if (this.computer.io.printer.busy) value = value.setBit(0);
      else value = value.clearBit(0);
      this.#STATE = value;
      yield { type: "handshake:register.update", register, value };

      // If CPU sent state with bit 1 set, send strobe to printer
      if (this.#STATE.bit(1)) {
        yield* this.computer.io.printer.setStrobe(true);
        yield* this.computer.io.printer.setStrobe(false);
        this.#STATE = this.#STATE.clearBit(1);
        yield { type: "handshake:register.update", register, value: this.#STATE };
      }

      // Update interrupt line
      if (this.interrupts && !this.computer.io.printer.busy) {
        yield* this.computer.io.pic.interrupt(2);
      }
    } else {
      return register; // Exhaustive check
    }

    yield { type: "handshake:write.ok" };
  }

  /**
   * Updates the value of the busy flag. Called by the printer.
   * If interrups are enabled, then an interrupt will be fired.
   * @see /docs/como-usar/dispositivos/handshake.md
   */
  *updateBusy(busy: boolean): EventGenerator {
    if (busy) this.#STATE = this.#STATE.setBit(0);
    else this.#STATE = this.#STATE.clearBit(0);
    yield { type: "handshake:register.update", register: "STATE", value: this.#STATE };

    if (this.interrupts && !busy) yield* this.computer.io.pic.interrupt(2);
  }

  toJSON() {
    return {
      DATA: this.#DATA.toJSON(),
      STATE: this.#STATE.toJSON(),
    } satisfies JsonObject;
  }
}
