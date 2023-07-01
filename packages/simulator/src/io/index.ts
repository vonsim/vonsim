import { IOAddress, IOAddressLike } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";
import type { JsonObject } from "type-fest";

import { Component, ComponentOptions, ComponentReset } from "../component";
import { SimulatorError } from "../error";
import type { EventGenerator } from "../events";
import { PIC } from "./pic";

export type ChipSelectEvent =
  | { type: "selected"; cs: "pic" }
  | { type: "error"; error: SimulatorError<"io-memory-not-implemented"> };

export class IO extends Component {
  static readonly SIZE = IOAddress.MAX_ADDRESS + 1;

  readonly pic: PIC;
  readonly #modules: ["pic", PIC][];

  constructor(options: ComponentOptions) {
    super(options);
    this.pic = new PIC(options);
    this.#modules = [["pic", this.pic]];
  }

  reset(options: ComponentReset): void {
    this.pic.reset(options);
  }

  /**
   * Reads a byte from IO memory at the specified address.
   * @param address The address to read the byte from.
   * @returns The byte at the specified address (always 8-bit) or null if there was an error.
   */
  *read(address: IOAddressLike): EventGenerator<Byte<8> | null> {
    for (const [name, module] of this.#modules) {
      const register = module.chipSelect(address);
      if (register) {
        yield { chip: "chip-select", type: "selected", cs: name };
        return yield* module.read(register);
      }
    }

    yield {
      chip: "chip-select",
      type: "error",
      error: new SimulatorError("io-memory-not-implemented", address),
    };
    return null;
  }

  /**
   * Writes a byte to IO memory at the specified address.
   * @param address The address to write the byte to.
   * @param value The byte to write.
   * @returns Wheather the operation succedeed or not (boolean).
   */
  *write(address: IOAddressLike, value: Byte<8>): EventGenerator<boolean> {
    for (const [name, module] of this.#modules) {
      const register = module.chipSelect(address);
      if (register) {
        yield { chip: "chip-select", type: "selected", cs: name };
        yield* module.write(register, value);
        return true;
      }
    }

    yield {
      chip: "chip-select",
      type: "error",
      error: new SimulatorError("io-memory-not-implemented", address),
    };
    return false;
  }

  toJSON(): JsonObject {
    const json: JsonObject = {};
    for (const [name, module] of this.#modules) {
      json[name] = module.toJSON();
    }
    return json;
  }
}
