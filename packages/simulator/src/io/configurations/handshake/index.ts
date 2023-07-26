import type { IOAddressLike } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";
import type { JsonObject } from "type-fest";

import type { ComponentInit } from "../../../component";
import type { EventGenerator } from "../../../events";
import { IOInterface } from "../../interface";
import { Handshake as HandshakeModule } from "./handshake";
import { Printer } from "./printer";

/**
 * `handshake` interface.
 *
 * Along with the common devices and modules, this interface also has:
 * - {@link Printer}
 * - {@link HandshakeModule | Handshake}
 *
 * ---
 * This class is: IMMUTABLE
 */
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

  *read(address: IOAddressLike): EventGenerator<Byte<8> | null> {
    const handshake = this.handshake.chipSelect(address);
    if (handshake) {
      yield { type: "cs:selected", chip: "handshake" };
      return yield* this.handshake.read(handshake);
    }

    return yield* super.read(address);
  }

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
