import type { IOAddressLike } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";
import type { JsonObject } from "type-fest";

import type { IORegister } from "../../../bus";
import type { ComponentInit } from "../../../component";
import type { EventGenerator } from "../../../events";
import { IOInterface } from "../../interface";
import { Leds } from "./leds";
import { PIO } from "./pio";
import { Switches } from "./switches";

/**
 * `pio-switches-and-leds` interface.
 *
 * Along with the common devices and modules, this interface also has:
 * - {@link Leds}
 * - {@link Switches}
 * - {@link PIO | PIO (for the switches and leds)}
 *
 * ---
 * This class is: IMMUTABLE
 */
export class PIOSwitchesAndLeds extends IOInterface<"pio-switches-and-leds"> {
  // Devices
  readonly leds: Leds;
  readonly switches: Switches;

  // Modules
  readonly pio: PIO;

  constructor(options: ComponentInit<"pio-switches-and-leds">) {
    super(options);
    this.leds = new Leds(options);
    this.switches = new Switches(options);
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
      leds: this.leds.toJSON(),
      switches: this.switches.toJSON(),
      pio: this.pio.toJSON(),
    } satisfies JsonObject;
  }
}
