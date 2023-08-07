import type { IOAddressLike } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";
import type { JsonObject } from "type-fest";

import type { IORegister } from "../../../bus";
import type { ComponentInit } from "../../../component";
import type { EventGenerator } from "../../../events";
import { IOInterface } from "../../interface";
import { PIO } from "./pio";
import { Printer } from "./printer";

/**
 * `pio-printer` interface.
 *
 * Along with the common devices and modules, this interface also has:
 * - {@link Printer}
 * - {@link PIO | PIO (for the printer)}
 *
 * ---
 * This class is: IMMUTABLE
 */
export class PIOPrinter extends IOInterface<"pio-printer"> {
  // Devices
  readonly printer: Printer;

  // Modules
  readonly pio: PIO;

  constructor(options: ComponentInit<"pio-printer">) {
    super(options);
    this.printer = new Printer(options);
    this.pio = new PIO(options);
  }

  *chipSelect(address: IOAddressLike): EventGenerator<IORegister | null> {
    const pio = this.pio.chipSelect(address);
    if (pio) {
      yield { type: "bus:io.selected", chip: "pio" };
      return { chip: "pio", register: pio };
    }

    return yield* super.chipSelect(address);
  }

  *read(register: IORegister): EventGenerator<Byte<8> | null> {
    if (register.chip === "pio") return yield* this.pio.read(register.register);

    return yield* super.read(register);
  }

  *write(register: IORegister, value: Byte<8>): EventGenerator<boolean> {
    if (register.chip === "pio") {
      yield* this.pio.write(register.register, value);
      return true;
    }

    return yield* super.write(register, value);
  }

  toJSON() {
    return {
      ...super.toJSON(),
      printer: this.printer.toJSON(),
      pio: this.pio.toJSON(),
    } satisfies JsonObject;
  }
}
