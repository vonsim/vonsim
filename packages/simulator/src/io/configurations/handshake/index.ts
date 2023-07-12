import type { IOAddressLike } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";
import type { JsonObject } from "type-fest";

import type { ComponentInit } from "../../../component";
import type { EventGenerator } from "../../../events";
import { IOInterface } from "../../interface";
import { Handshake as HandshakeModule } from "./handshake";
import { Printer } from "./printer";

export class Handshake extends IOInterface<"handshake"> {
  // Devices
  readonly printer: Printer;

  // Modules
  readonly handshake: HandshakeModule;

  constructor(options: ComponentInit<"handshake">) {
    super(options);
    this.printer = new Printer(options);
    this.handshake = new HandshakeModule(options);
  }

  /**
   * Reads a byte from IO memory at the specified address.
   * @param address The address to read the byte from.
   * @returns The byte at the specified address (always 8-bit) or null if there was an error.
   */
  *read(address: IOAddressLike): EventGenerator<Byte<8> | null> {
    const handshake = this.handshake.chipSelect(address);
    if (handshake) {
      yield { type: "cs:selected", chip: "handshake" };
      return yield* this.handshake.read(handshake);
    }

    return yield* super.read(address);
  }

  /**
   * Writes a byte to IO memory at the specified address.
   * @param address The address to write the byte to.
   * @param value The byte to write.
   * @returns Whether the operation succedeed or not (boolean).
   */
  *write(address: IOAddressLike, value: Byte<8>): EventGenerator<boolean> {
    const handshake = this.handshake.chipSelect(address);
    if (handshake) {
      yield { type: "cs:selected", chip: "handshake" };
      yield* this.handshake.write(handshake, value);
      return true;
    }

    return yield* super.write(address, value);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      printer: this.printer.toJSON(),
      handshake: this.handshake.toJSON(),
    } satisfies JsonObject;
  }
}
