import type { IOAddressLike } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";

import { Component } from "../component";
import type { EventGenerator } from "../events";

/**
 * An IO module is a component that can be connected to the
 * IO bus of the computer.
 *
 * @template TRegisters The type of the registers of the IO module (like 'R1' | 'R2' | 'R3')
 */
export abstract class IOModule<TRegister extends string> extends Component {
  /**
   * Given an address, returns whether that address is
   * in the range of the IO module and which register
   * corresponds to that address.
   */
  abstract chipSelect(address: IOAddressLike): TRegister | null;

  /**
   * Reads the register from the IO module.
   * @param register The register to read.
   * @returns The byte at the specified register (always 8-bit).
   */
  abstract read(register: TRegister): EventGenerator<Byte<8>>;

  /**
   * Writes a byte to the IO module at the specified register.
   * @param register The register to write the byte to.
   * @param value The byte to write.
   */
  abstract write(register: TRegister, value: Byte<8>): EventGenerator;
}
