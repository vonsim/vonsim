import type { IOAddressLike } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";
import type { JsonObject } from "type-fest";

import type { IORegister } from "../../../bus";
import { Component, ComponentInit } from "../../../component";
import { SimulatorError } from "../../../error";
import type { EventGenerator } from "../../../events";
import { Clock } from "../../devices/clocks";
import { F10 } from "../../devices/f10";
import { Keyboard } from "../../devices/keyboard";
import { Screen } from "../../devices/screen";
import { IOInterface } from "../../interface";
import { PIC } from "../../modules/pic";
import { Timer } from "../../modules/timer";
import { Leds } from "./leds";
import { PIO } from "./pio";
import { Switches } from "./switches";

/**
 * `pio-switches-and-leds` interface.
 *
 * - Devices:
 *   - {@link Clock}
 *   - {@link F10}
 *   - {@link Keyboard}
 *   - {@link Leds}
 *   - {@link Screen}
 *   - {@link Switches}
 * - Modules:
 *   - {@link PIC}
 *   - {@link PIO | PIO (for the switches and leds)}
 *   - {@link Timer}
 *
 * ---
 * This class is: IMMUTABLE
 */
export class PIOSwitchesAndLeds extends Component<"pio-switches-and-leds"> implements IOInterface {
  // Devices
  readonly clock: Clock<"pio-switches-and-leds">;
  readonly f10: F10<"pio-switches-and-leds">;
  readonly keyboard: Keyboard<"pio-switches-and-leds">;
  readonly leds: Leds;
  readonly screen: Screen<"pio-switches-and-leds">;
  readonly switches: Switches;

  // Modules
  readonly pic: PIC<"pio-switches-and-leds">;
  readonly pio: PIO;
  readonly timer: Timer<"pio-switches-and-leds">;

  constructor(options: ComponentInit<"pio-switches-and-leds">) {
    super(options);

    this.clock = new Clock(options);
    this.f10 = new F10(options);
    this.keyboard = new Keyboard(options);
    this.leds = new Leds(options);
    this.screen = new Screen(options);
    this.switches = new Switches(options);

    this.pic = new PIC(options);
    this.pio = new PIO(options);
    this.timer = new Timer(options);
  }

  *chipSelect(address: IOAddressLike): EventGenerator<IORegister | null> {
    const pic = this.pic.chipSelect(address);
    if (pic) {
      yield { type: "bus:io.selected", chip: "pic" };
      return { chip: "pic", register: pic };
    }

    const pio = this.pio.chipSelect(address);
    if (pio) {
      yield { type: "bus:io.selected", chip: "pio" };
      return { chip: "pio", register: pio };
    }

    const timer = this.timer.chipSelect(address);
    if (timer) {
      yield { type: "bus:io.selected", chip: "timer" };
      return { chip: "timer", register: timer };
    }

    yield { type: "bus:io.error", error: new SimulatorError("io-memory-not-connected", address) };
    return null;
  }

  *read(register: IORegister): EventGenerator<Byte<8> | null> {
    const { chip, register: reg } = register;

    if (chip === "pic") return yield* this.pic.read(reg);
    if (chip === "pio") return yield* this.pio.read(reg);
    if (chip === "timer") return yield* this.timer.read(reg);

    yield { type: "bus:io.error", error: new SimulatorError("device-not-connected", chip) };
    return null;
  }

  *write(register: IORegister, value: Byte<8>): EventGenerator<boolean> {
    const { chip, register: reg } = register;

    if (chip === "pic") {
      yield* this.pic.write(reg, value);
      return true;
    }

    if (chip === "pio") {
      yield* this.pio.write(reg, value);
      return true;
    }

    if (chip === "timer") {
      yield* this.timer.write(reg, value);
      return true;
    }

    yield { type: "bus:io.error", error: new SimulatorError("device-not-connected", chip) };
    return false;
  }

  toJSON() {
    return {
      clock: this.clock.toJSON(),
      f10: this.f10.toJSON(),
      keyboard: this.keyboard.toJSON(),
      leds: this.leds.toJSON(),
      screen: this.screen.toJSON(),
      switches: this.switches.toJSON(),

      pic: this.pic.toJSON(),
      pio: this.pio.toJSON(),
      timer: this.timer.toJSON(),
    } satisfies JsonObject;
  }
}
