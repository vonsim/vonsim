import type { IOAddressLike } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";

import type { IORegister } from "../bus";
import type { EventGenerator } from "../events";

/**
 * An IO interface is a set of devices and modules that can be used by the CPU to
 * interact with the outside world.
 *
 * These classes exposes these methods so the CPU can interact with all the devices
 * in a standard way.
 */
export type IOInterface = {
  /**
   * Determines which chip is selected by the specified address.
   * @param address The address to check.
   * @returns The chip and register selected by the address, or null if the address is not mapped.
   *
   * ---
   * Called by the CPU.
   */
  chipSelect: (address: IOAddressLike) => EventGenerator<IORegister | null>;

  /**
   * Reads a byte from IO memory at the specified register.
   * @param register The register to read the byte from.
   * @returns The byte at the specified register (always 8-bit) or null if there was an error.
   *
   * ---
   * Called by the CPU.
   */
  read: (register: IORegister) => EventGenerator<Byte<8> | null>;

  /**
   * Writes a byte to IO memory at the specified register.
   * @param register The register to write the byte to.
   * @param value The byte to write.
   * @returns Whether the operation succedeed or not (boolean).
   *
   * ---
   * Called by the CPU.
   */
  write: (register: IORegister, value: Byte<8>) => EventGenerator<boolean>;
};
