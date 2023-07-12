import { IOAddress, IOAddressLike } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";
import type { JsonObject } from "type-fest";

import { Component, ComponentInit, DevicesConfiguration } from "../component";
import { SimulatorError } from "../error";
import type { EventGenerator } from "../events";
import { Clock } from "./devices/clocks";
import { Console } from "./devices/console";
import { F10 } from "./devices/f10";
import { PIC } from "./modules/pic";
import { Timer } from "./modules/timer";

export type ChipSelectEvent =
  | { type: "cs:selected"; chip: "handshake" | "pic" | "pio" | "timer" }
  | { type: "cs:error"; error: SimulatorError<"io-memory-not-implemented"> };

export abstract class IOInterface<
  TDevices extends DevicesConfiguration,
> extends Component<TDevices> {
  static readonly SIZE = IOAddress.MAX_ADDRESS + 1;

  // Devices
  readonly clock: Clock;
  readonly console: Console;
  readonly f10: F10;

  // Modules
  readonly pic: PIC;
  readonly timer: Timer;

  constructor(options: ComponentInit<TDevices>) {
    super(options);

    this.clock = new Clock(options);
    this.console = new Console(options);
    this.f10 = new F10(options);

    this.pic = new PIC(options);
    this.timer = new Timer(options);
  }

  /**
   * Reads a byte from IO memory at the specified address.
   * @param address The address to read the byte from.
   * @returns The byte at the specified address (always 8-bit) or null if there was an error.
   */
  *read(address: IOAddressLike): EventGenerator<Byte<8> | null> {
    const pic = this.pic.chipSelect(address);
    if (pic) {
      yield { type: "cs:selected", chip: "pic" };
      return yield* this.pic.read(pic);
    }

    const timer = this.timer.chipSelect(address);
    if (timer) {
      yield { type: "cs:selected", chip: "timer" };
      return yield* this.timer.read(timer);
    }

    yield { type: "cs:error", error: new SimulatorError("io-memory-not-implemented", address) };
    return null;
  }

  /**
   * Writes a byte to IO memory at the specified address.
   * @param address The address to write the byte to.
   * @param value The byte to write.
   * @returns Whether the operation succedeed or not (boolean).
   */
  *write(address: IOAddressLike, value: Byte<8>): EventGenerator<boolean> {
    const pic = this.pic.chipSelect(address);
    if (pic) {
      yield { type: "cs:selected", chip: "pic" };
      yield* this.pic.write(pic, value);
      return true;
    }

    const timer = this.timer.chipSelect(address);
    if (timer) {
      yield { type: "cs:selected", chip: "timer" };
      yield* this.timer.write(timer, value);
      return true;
    }

    yield { type: "cs:error", error: new SimulatorError("io-memory-not-implemented", address) };
    return false;
  }

  toJSON() {
    return {
      clock: this.clock.toJSON(),
      console: this.console.toJSON(),
      f10: this.f10.toJSON(),

      pic: this.pic.toJSON(),
      timer: this.timer.toJSON(),
    } satisfies JsonObject;
  }
}
