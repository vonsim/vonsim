import type { IOAddressLike } from "@vonsim/common/address";
import { Byte } from "@vonsim/common/byte";
import type { JsonObject } from "type-fest";

import type { ComponentInit } from "../../component";
import type { EventGenerator } from "../../events";
import type { Leds } from "../devices/leds";
import type { Printer } from "../devices/printer";
import type { Switches } from "../devices/switches";
import { IOModule } from "../module";

export type PIOPort = "A" | "B";
export type PIORegister = `P${PIOPort}` | `C${PIOPort}`;

export type PIOOperation =
  | { type: "pio:read"; register: PIORegister }
  | { type: "pio:read.ok"; value: Byte<8> }
  | { type: "pio:write"; register: PIORegister; value: Byte<8> }
  | { type: "pio:write.ok" }
  | { type: "pio:register.update"; register: PIORegister; value: Byte<8> };

/**
 * The Programmed Input/Output (PIO) is a module that provides a standard
 * interface for devices to communicate with the computer.
 *
 * Reserved addresses:
 * - 30h: PA
 * - 31h: PB
 * - 32h: CA
 * - 33h: CB
 *
 * This class is abstract because it can be connected to different devices,
 * but they are share some common functionality.
 *
 * @see {@link https://vonsim.github.io/docs/io/modules/pio/}.
 *
 * ---
 * These classes are: MUTABLE
 */
export abstract class PIO extends IOModule<PIORegister> {
  protected PA: Byte<8>;
  protected PB: Byte<8>;
  protected CA: Byte<8>;
  protected CB: Byte<8>;

  /**
   * Led lights. These are only modified by the PIO, not the user.
   *
   * @see {@link https://vonsim.github.io/docs/io/devices/switches-and-leds/}.
   *
   * ---
   * This class is: MUTABLE
   */
  readonly leds: Leds | null = null;
  /**
   * Printer connected to a PIO. It's declared here just for TypeScript purposes.
   *
   * @see
   * - {@link Printer}.
   * - {@link https://vonsim.github.io/docs/io/devices/printer/#imprimir-con-pio}.
   *
   * ---
   * This class is: MUTABLE
   */
  readonly printer: Printer | null = null;
  /**
   * Led lights. These are only modified by the PIO, not the user.
   *
   * @see {@link https://vonsim.github.io/docs/io/devices/switches-and-leds/}.
   *
   * ---
   * This class is: MUTABLE
   */
  readonly switches: Switches | null = null;

  constructor(options: ComponentInit) {
    super(options);
    if (options.data === "unchanged" && options.previous.io.pio) {
      this.PA = options.previous.io.pio.PA;
      this.PB = options.previous.io.pio.PB;
      this.CA = options.previous.io.pio.CA;
      this.CB = options.previous.io.pio.CB;
    } else if (options.data === "randomize") {
      this.PA = Byte.random(8);
      this.PB = Byte.random(8);
      this.CA = Byte.random(8);
      this.CB = Byte.random(8);
    } else {
      this.PA = Byte.zero(8);
      this.PB = Byte.zero(8);
      this.CA = Byte.zero(8);
      this.CB = Byte.zero(8);
    }
  }

  chipSelect(address: IOAddressLike): PIORegister | null {
    address = Number(address);
    if (address === 0x30) return "PA";
    else if (address === 0x31) return "PB";
    else if (address === 0x32) return "CA";
    else if (address === 0x33) return "CB";
    else return null;
  }

  *read(register: PIORegister): EventGenerator<Byte<8>> {
    yield { type: "pio:read", register };

    let value: Byte<8>;
    if (register === "PA") value = this.PA;
    else if (register === "PB") value = this.PB;
    else if (register === "CA") value = this.CA;
    else if (register === "CB") value = this.CB;
    else return register; // Exhaustive check

    yield { type: "pio:read.ok", value };
    return value;
  }

  *write(register: PIORegister, value: Byte<8>): EventGenerator {
    yield { type: "pio:write", register, value };

    if (register === "PA") this.PA = value;
    else if (register === "PB") this.PB = value;
    else if (register === "CA") this.CA = value;
    else if (register === "CB") this.CB = value;
    else return register; // Exhaustive check

    yield { type: "pio:register.update", register, value };

    if (register === "PA" || register === "CA") yield* this.updatePort("A");
    else yield* this.updatePort("B");

    yield { type: "pio:write.ok" };
  }

  /**
   * Updates the state of the port, according to the device connected to it
   * and the state of the PIO.
   *
   * ---
   * Called by the device connected to the port and {@link PIO.write}.
   */
  abstract updatePort(port: PIOPort): EventGenerator;

  /**
   * @param port The port to check.
   * @param index Which line to check (0-7).
   * @returns Whether the line is input or output.
   * @see {@link https://vonsim.github.io/docs/io/modules/pio/}.
   *
   * ---
   * Called by {@link PIO.updatePort}.
   */
  protected line(port: PIOPort, index: number): "input" | "output" {
    // 0 = output, 1 = input
    if (port === "A") return this.CA.bit(index) ? "input" : "output";
    else return this.CB.bit(index) ? "input" : "output";
  }

  toJSON() {
    return {
      PA: this.PA.toJSON(),
      PB: this.PB.toJSON(),
      CA: this.CA.toJSON(),
      CB: this.CB.toJSON(),
    } satisfies JsonObject;
  }
}
