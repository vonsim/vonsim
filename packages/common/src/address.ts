import { Byte } from "./byte";

/**
 * Memory address.
 * It's saved as a 16-bit unsigned integer.
 *
 * ---
 * This class is: IMMUTABLE
 */
export class MemoryAddress {
  static readonly MIN_ADDRESS = 0x0000;
  static readonly MAX_ADDRESS = 0x7fff;

  #address: Byte;

  private constructor(address: Byte) {
    this.#address = address;
  }

  get value(): number {
    return this.#address.unsigned;
  }

  /**
   * Returns the byte as a string.
   * @param [trailinhG=false] Whether to add a trailing 'h'.
   */
  toString(trailingH = true): string {
    let result = this.#address.toString("hex");
    if (trailingH) result += "h";
    return result;
  }

  /**
   * Returns the byte as a JSON number.
   * Useful for serialization.
   */
  toJSON(): number {
    return this.#address.toJSON();
  }

  // #=========================================================================#
  // # Static methods                                                          #
  // #=========================================================================#

  /**
   * Returns whether the given address is in range.
   * @param address Either a number, a Byte, or a MemoryAddress.
   * @param [offset=0] An optional offset to add to the address.
   * @returns Whether the address is in range.
   */
  static inRange(address: MemoryAddress | Byte | number, offset = 0): boolean {
    if (address instanceof MemoryAddress) address = address.value;
    if (address instanceof Byte) address = address.unsigned;
    address += offset;

    return (
      Number.isSafeInteger(address) &&
      address >= MemoryAddress.MIN_ADDRESS &&
      address <= MemoryAddress.MAX_ADDRESS
    );
  }

  /**
   * Creates a new MemoryAddress.
   * @param address Either a number, a Byte, or a MemoryAddress.
   * @param [offset=0] An optional offset to add to the address.
   * @returns A new MemoryAddress.
   */
  static from(address: MemoryAddress | Byte | number, offset = 0): MemoryAddress {
    if (address instanceof MemoryAddress) address = address.value;
    if (address instanceof Byte) address = address.unsigned;
    address += offset;

    if (!MemoryAddress.inRange(address)) {
      throw new RangeError(`Address ${address} is out of range.`);
    }

    const byte = Byte.fromUnsigned(address, 16);
    return new MemoryAddress(byte);
  }
}

/**
 * Input/Output address.
 * It's saved as a 8-bit unsigned integer.
 *
 * ---
 * This class is: IMMUTABLE
 */
export class IOAddress {
  static readonly MIN_ADDRESS = 0x00;
  static readonly MAX_ADDRESS = 0x7f;

  #address: Byte;

  private constructor(address: Byte) {
    this.#address = address;
  }

  get value(): number {
    return this.#address.unsigned;
  }

  /**
   * Returns the byte as a string.
   * @param [trailinhG=false] Whether to add a trailing 'h'.
   */
  toString(trailingH = true): string {
    let result = this.#address.toString("hex");
    if (trailingH) result += "h";
    return result;
  }

  /**
   * Returns the byte as a JSON number.
   * Useful for serialization.
   */
  toJSON(): number {
    return this.#address.toJSON();
  }

  // #=========================================================================#
  // # Static methods                                                          #
  // #=========================================================================#

  /**
   * Returns whether the given address is in range.
   * @param address Either a number, a Byte, or a IOAddress.
   * @param [offset=0] An optional offset to add to the address.
   * @returns Whether the address is in range.
   */
  static inRange(address: IOAddress | Byte | number, offset = 0): boolean {
    if (address instanceof IOAddress) address = address.value;
    if (address instanceof Byte) address = address.unsigned;
    address += offset;

    return (
      Number.isSafeInteger(address) &&
      address >= IOAddress.MIN_ADDRESS &&
      address <= IOAddress.MAX_ADDRESS
    );
  }

  /**
   * Creates a new IOAddress.
   * @param address Either a number, a Byte, or a IOAddress.
   * @param [offset=0] An optional offset to add to the address.
   * @returns A new IOAddress.
   */
  static from(address: MemoryAddress | Byte | number, offset = 0): IOAddress {
    if (address instanceof MemoryAddress) address = address.value;
    if (address instanceof Byte) address = address.unsigned;
    address += offset;

    if (!MemoryAddress.inRange(address)) {
      throw new RangeError(`Address ${address} is out of range.`);
    }

    const byte = Byte.fromUnsigned(address, 8);
    return new IOAddress(byte);
  }
}
