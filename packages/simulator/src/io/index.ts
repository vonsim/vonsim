import type { IOAddressLike } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";
import type { JsonObject } from "type-fest";

import type { IORegister } from "../bus";
import { Component, ComponentInit } from "../component";
import { SimulatorError } from "../error";
import type { EventGenerator } from "../events";
import { PIOPrinter } from "./connections/pio-printer";
import { PIOSwitchesAndLeds } from "./connections/pio-switches-and-leds";
import { Clock } from "./devices/clock";
import { F10 } from "./devices/f10";
import { Keyboard } from "./devices/keyboard";
import type { Leds } from "./devices/leds";
import type { Printer } from "./devices/printer";
import { Screen } from "./devices/screen";
import type { Switches } from "./devices/switches";
import { Handshake } from "./modules/handshake";
import { PIC } from "./modules/pic";
import { PIO } from "./modules/pio";
import { Timer } from "./modules/timer";

/**
 * The IO interface is the set of devices and modules that can be used by the CPU to
 * interact with the outside world.
 *
 * This object exposes methods so the CPU can interact with all the devices
 * in a standard way.
 */
export class IOInterface extends Component {
  // Devices
  readonly clock: Clock | null = null;
  readonly f10: F10 | null = null;
  readonly keyboard: Keyboard | null = null;
  get leds(): Leds | null {
    return this.pio?.leds ?? null;
  }
  get printer(): Printer | null {
    return this.pio?.printer ?? this.handshake?.printer ?? null;
  }
  readonly screen: Screen | null = null;
  get switches(): Switches | null {
    return this.pio?.switches ?? null;
  }

  // Modules
  readonly handshake: Handshake | null = null;
  readonly pic: PIC | null = null;
  readonly pio: PIO | null = null;
  readonly timer: Timer | null = null;

  constructor(options: ComponentInit) {
    super(options);

    if (options.devices.keyboardAndScreen) {
      this.keyboard = new Keyboard(options);
      this.screen = new Screen(options);
    }

    if (options.devices.pic) {
      this.clock = new Clock(options);
      this.f10 = new F10(options);
      this.timer = new Timer(options);
      this.pic = new PIC(options);
    }

    this.pio =
      options.devices.pio === "switches-and-leds"
        ? new PIOSwitchesAndLeds(options)
        : options.devices.pio === "printer"
          ? new PIOPrinter(options)
          : null;

    if (options.devices.handshake) {
      if (this.pio instanceof PIOPrinter) {
        throw new SimulatorError("io-printer-conflict");
      }
      this.handshake = new Handshake(options);
    }
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
    const handshake = this.handshake?.chipSelect(address);
    if (handshake) {
      yield { type: "bus:io.selected", chip: "handshake" };
      return { chip: "handshake", register: handshake };
    }

    const pic = this.pic?.chipSelect(address);
    if (pic) {
      yield { type: "bus:io.selected", chip: "pic" };
      return { chip: "pic", register: pic };
    }

    const pio = this.pio?.chipSelect(address);
    if (pio) {
      yield { type: "bus:io.selected", chip: "pio" };
      return { chip: "pio", register: pio };
    }

    const timer = this.timer?.chipSelect(address);
    if (timer) {
      yield { type: "bus:io.selected", chip: "timer" };
      return { chip: "timer", register: timer };
    }

    yield { type: "bus:io.error", error: new SimulatorError("io-memory-not-connected", address) };
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

    if (this[chip]) {
      // @ts-expect-error it works fine
      return yield* this[chip].read(reg);
    }

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

    if (this[chip]) {
      // @ts-expect-error it works fine
      yield* this[chip].write(reg, value);
      return true;
    }

    yield { type: "bus:io.error", error: new SimulatorError("device-not-connected", chip) };
    return false;
  }

  toJSON() {
    return {
      clock: this.clock?.toJSON() ?? null,
      f10: this.f10?.toJSON() ?? null,
      keyboard: this.keyboard?.toJSON() ?? null,
      leds: this.leds?.toJSON() ?? null,
      printer: this.printer?.toJSON() ?? null,
      screen: this.screen?.toJSON() ?? null,
      switches: this.switches?.toJSON() ?? null,

      handshake: this.handshake?.toJSON() ?? null,
      pic: this.pic?.toJSON() ?? null,
      pio: this.pio?.toJSON() ?? null,
      timer: this.timer?.toJSON() ?? null,
    } satisfies JsonObject;
  }
}
