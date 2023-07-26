import type { IOAddressLike } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";

import { Component, DevicesConfiguration } from "../component";
import type { EventGenerator } from "../events";

/**
 * An IO module is a component that can be connected to the
 * IO bus of the computer (aka, the IOInterface).
 *
 * @template TRegisters The type of the registers of the IO module (like 'R1' | 'R2' | 'R3')
 *
 * ---
 * These classes are: MUTABLE
 */
export abstract class IOModule<
  TRegister extends string,
  TDevices extends DevicesConfiguration = DevicesConfiguration,
> extends Component<TDevices> {
  /**
   * Given an address, returns whether that address is
   * in the range of the IO module and which register
   * corresponds to that address.
   *
   * ---
   * Called by the IO interface.
   */
  abstract chipSelect(address: IOAddressLike): TRegister | null;

  /**
   * Reads the register from the IO module.
   * @param register The register to read.
   * @returns The byte at the specified register (always 8-bit).
   *
   * ---
   * Called by the IO interface.
   */
  abstract read(register: TRegister): EventGenerator<Byte<8>>;

  /**
   * Writes a byte to the IO module at the specified register.
   * @param register The register to write the byte to.
   * @param value The byte to write.
   *
   * ---
   * Called by the IO interface.
   */
  abstract write(register: TRegister, value: Byte<8>): EventGenerator;
}
