import { IOAddress, IOAddressLike } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";
import type { JsonObject } from "type-fest";

import type { IORegister } from "../bus";
import { Component, ComponentInit, DevicesConfiguration } from "../component";
import { SimulatorError } from "../error";
import type { EventGenerator } from "../events";
import { Clock } from "./devices/clocks";
import { F10 } from "./devices/f10";
import { Keyboard } from "./devices/keyboard";
import { Screen } from "./devices/screen";
import { PIC } from "./modules/pic";
import { Timer } from "./modules/timer";

/**
 * An IO interface is a set of devices and modules that can be used by the CPU to
 * interact with the outside world.
 *
 * In this abstract class, some common devices and modules are implemented, but an
 * interface can be extended to add more. These are:
 * - Devices:
 *   - {@link Clock}
 *   - {@link F10}
 *   - {@link Keyboard}
 *   - {@link Screen}
 * - Modules:
 *   - {@link PIC}
 *   - {@link Timer}
 *
 * ---
 * These classes are: IMMUTABLE
 */
export abstract class IOInterface<
  TDevices extends DevicesConfiguration,
> extends Component<TDevices> {
  static readonly SIZE = IOAddress.MAX_ADDRESS + 1;

  // Devices
  readonly clock: Clock;
  readonly f10: F10;
  readonly keyboard: Keyboard;
  readonly screen: Screen;

  // Modules
  readonly pic: PIC;
  readonly timer: Timer;

  constructor(options: ComponentInit<TDevices>) {
    super(options);

    this.clock = new Clock(options);
    this.f10 = new F10(options);
    this.keyboard = new Keyboard(options);
    this.screen = new Screen(options);

    this.pic = new PIC(options);
    this.timer = new Timer(options);
  }

  /**
   * Determines which chip is selected by the specified address.
   * @param address The address to check.
   * @returns The chip and register selected by the address, or null if the address is not mapped.
   *
   * ---
   * Called by the CPU.
   */
  *chipSelect(address: IOAddressLike): EventGenerator<IORegister | null> {
    const pic = this.pic.chipSelect(address);
    if (pic) {
      yield { type: "bus:io.selected", chip: "pic" };
      return { chip: "pic", register: pic };
    }

    const timer = this.timer.chipSelect(address);
    if (timer) {
      yield { type: "bus:io.selected", chip: "timer" };
      return { chip: "timer", register: timer };
    }

    yield { type: "bus:io.error", error: new SimulatorError("io-memory-not-implemented", address) };
    return null;
  }

  /**
   * Reads a byte from IO memory at the specified register.
   * @param register The register to read the byte from.
   * @returns The byte at the specified register (always 8-bit) or null if there was an error.
   *
   * ---
   * Called by the CPU.
   */
  *read(register: IORegister): EventGenerator<Byte<8> | null> {
    const { chip, register: reg } = register;

    if (chip === "pic") return yield* this.pic.read(reg);
    if (chip === "timer") return yield* this.timer.read(reg);

    yield { type: "bus:io.error", error: new SimulatorError("device-not-connected", chip) };
    return null;
  }

  /**
   * Writes a byte to IO memory at the specified register.
   * @param register The register to write the byte to.
   * @param value The byte to write.
   * @returns Whether the operation succedeed or not (boolean).
   *
   * ---
   * Called by the CPU.
   */
  *write(register: IORegister, value: Byte<8>): EventGenerator<boolean> {
    const { chip, register: reg } = register;

    if (chip === "pic") {
      yield* this.pic.write(reg, value);
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
      screen: this.screen.toJSON(),

      pic: this.pic.toJSON(),
      timer: this.timer.toJSON(),
    } satisfies JsonObject;
  }
}
