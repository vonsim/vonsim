import type { IOAddressLike } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";
import type { JsonObject } from "type-fest";

import type { IORegister } from "../../../bus";
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

  *chipSelect(address: IOAddressLike): EventGenerator<IORegister | null> {
    const handshake = this.handshake.chipSelect(address);
    if (handshake) {
      yield { type: "bus:io.selected", chip: "handshake" };
      return { chip: "handshake", register: handshake };
    }

    return yield* super.chipSelect(address);
  }

  *read(register: IORegister): EventGenerator<Byte<8> | null> {
    if (register.chip === "handshake") return yield* this.handshake.read(register.register);

    return yield* super.read(register);
  }

  *write(register: IORegister, value: Byte<8>): EventGenerator<boolean> {
    if (register.chip === "handshake") {
      yield* this.handshake.write(register.register, value);
      return true;
    }

    return yield* super.write(register, value);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      printer: this.printer.toJSON(),
      handshake: this.handshake.toJSON(),
    } satisfies JsonObject;
  }
}
