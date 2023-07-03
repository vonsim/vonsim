import { IOAddress, IOAddressLike } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";
import type { JsonObject, TupleToUnion } from "type-fest";

import { Component, ComponentOptions, ComponentReset } from "../component";
import { SimulatorError } from "../error";
import type { EventGenerator } from "../events";
import { PIC } from "./modules/pic";
import { PIOPrinter } from "./modules/pio/printer";
import { PIOSwitchesAndLeds } from "./modules/pio/switches-and-leds";
import { Timer } from "./modules/timer";

export type ChipSelectEvent =
  | { type: "selected"; chip: TupleToUnion<typeof IO.MODULES> }
  | { type: "error"; error: SimulatorError<"io-memory-not-implemented"> };

export class IO extends Component {
  static readonly SIZE = IOAddress.MAX_ADDRESS + 1;

  #devices: ComponentReset["devices"] = "pio-switches-and-leds";

  static readonly MODULES = ["pio", "pic", "timer"] as const;
  #pioPrinter: PIOPrinter;
  #pioSwitchesAndLeds: PIOSwitchesAndLeds;
  #pic: PIC;
  #timer: Timer;

  constructor(options: ComponentOptions) {
    super(options);
    this.#pioSwitchesAndLeds = new PIOSwitchesAndLeds(options);
    this.#pioPrinter = new PIOPrinter(options);
    this.#pic = new PIC(options);
    this.#timer = new Timer(options);
  }

  reset(options: ComponentReset): void {
    this.#devices = options.devices;
    for (const module of IO.MODULES) {
      this[module]?.reset(options);
    }
  }

  get pio() {
    if (this.#devices === "pio-switches-and-leds") return this.#pioSwitchesAndLeds;
    else if (this.#devices === "pio-printer") return this.#pioPrinter;
    return null;
  }

  get pic() {
    return this.#pic;
  }

  get timer() {
    return this.#timer;
  }

  /**
   * Reads a byte from IO memory at the specified address.
   * @param address The address to read the byte from.
   * @returns The byte at the specified address (always 8-bit) or null if there was an error.
   */
  *read(address: IOAddressLike): EventGenerator<Byte<8> | null> {
    for (const name of IO.MODULES) {
      const module = this[name];
      if (!module) continue;
      const register = module.chipSelect(address);
      if (register) {
        yield { component: "chip-select", type: "selected", chip: name };
        return yield* module.read(register as never);
      }
    }

    yield {
      component: "chip-select",
      type: "error",
      error: new SimulatorError("io-memory-not-implemented", address),
    };
    return null;
  }

  /**
   * Writes a byte to IO memory at the specified address.
   * @param address The address to write the byte to.
   * @param value The byte to write.
   * @returns Whether the operation succedeed or not (boolean).
   */
  *write(address: IOAddressLike, value: Byte<8>): EventGenerator<boolean> {
    for (const name of IO.MODULES) {
      const module = this[name];
      if (!module) continue;
      const register = module.chipSelect(address);
      if (register) {
        yield { component: "chip-select", type: "selected", chip: name };
        yield* module.write(register as never, value);
        return true;
      }
    }

    yield {
      component: "chip-select",
      type: "error",
      error: new SimulatorError("io-memory-not-implemented", address),
    };
    return false;
  }

  toJSON(): JsonObject {
    const json: JsonObject = {};
    for (const name of IO.MODULES) {
      const module = this[name];
      if (module) json[name] = module.toJSON();
    }
    return json;
  }
}
