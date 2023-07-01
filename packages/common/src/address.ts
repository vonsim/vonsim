import { AnyByte, Byte } from "./byte";

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

  #address: Byte<16>;

  private constructor(address: Byte<16>) {
    this.#address = address;
  }

  get value(): number {
    return this.#address.unsigned;
  }

  /**
   * Return the address as a byte.
   */
  get byte(): Byte<16> {
    return this.#address;
  }

  /**
   * Returns the byte as a string.
   * @param [trailinhG=true] Whether to add a trailing 'h'.
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

  valueOf(): number {
    return this.#address.valueOf();
  }

  // #=========================================================================#
  // # Static methods                                                          #
  // #=========================================================================#

  /**
   * Returns whether the given address is in range.
   * @param {MemoryAddressLike} address Either a number, a Byte, or a MemoryAddress.
   * @returns Whether the address is in range.
   */
  static inRange(address: MemoryAddressLike): boolean {
    address = Number(address);

    return (
      Number.isSafeInteger(address) &&
      address >= MemoryAddress.MIN_ADDRESS &&
      address <= MemoryAddress.MAX_ADDRESS
    );
  }

  /**
   * Creates a new MemoryAddress.
   * @param {MemoryAddressLike} address Either a number, a Byte, or a MemoryAddress.
   * @returns A new MemoryAddress.
   */
  static from(address: MemoryAddressLike): MemoryAddress {
    address = Number(address);

    if (!MemoryAddress.inRange(address)) {
      throw new RangeError(`Address ${address} is out of range.`);
    }

    const byte = Byte.fromUnsigned(address, 16);
    return new MemoryAddress(byte);
  }

  /**
   * Formats the given address as a string (even if it's out of range)
   * @param address Either a number, a Byte, or a MemoryAddress.
   * @param [trailingH=true] Whether to add a trailing 'h'.
   * @returns A new MemoryAddress.
   */
  static format(address: MemoryAddressLike, trailingH = true): string {
    address = Number(address);

    if (!Number.isSafeInteger(address) || address < 0) {
      return "????";
    }

    let result = address.toString(16).padStart(4, "0").toUpperCase();
    if (trailingH) result += "h";

    return result;
  }
}

export type MemoryAddressLike = MemoryAddress | AnyByte | number;

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

  #address: Byte<8>;

  private constructor(address: Byte<8>) {
    this.#address = address;
  }

  get value(): number {
    return this.#address.unsigned;
  }

  /**
   * Return the address as a byte.
   */
  get byte(): Byte<8> {
    return this.#address;
  }

  /**
   * Returns the byte as a string.
   * @param [trailinhG=true] Whether to add a trailing 'h'.
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

  valueOf(): number {
    return this.#address.valueOf();
  }

  // #=========================================================================#
  // # Static methods                                                          #
  // #=========================================================================#

  /**
   * Returns whether the given address is in range.
   * @param {IOAddressLike} address Either a number, a Byte, or a IOAddress.
   * @returns Whether the address is in range.
   */
  static inRange(address: IOAddressLike): boolean {
    address = Number(address);

    return (
      Number.isSafeInteger(address) &&
      address >= IOAddress.MIN_ADDRESS &&
      address <= IOAddress.MAX_ADDRESS
    );
  }

  /**
   * Creates a new IOAddress.
   * @param {IOAddressLike} address Either a number, a Byte, or a IOAddress.
   * @returns A new IOAddress.
   */
  static from(address: IOAddressLike): IOAddress {
    address = Number(address);

    if (!IOAddress.inRange(address)) {
      throw new RangeError(`Address ${address} is out of range.`);
    }

    const byte = Byte.fromUnsigned(address, 8);
    return new IOAddress(byte);
  }

  /**
   * Formats the given address as a string (even if it's out of range)
   * @param address Either a number, a Byte, or a IOAddress.
   * @param [trailingH=true] Whether to add a trailing 'h'.
   * @returns A new IOAddress.
   */
  static format(address: IOAddressLike, trailingH = true): string {
    address = Number(address);

    if (!Number.isSafeInteger(address) || address < 0) {
      return "??";
    }

    let result = address.toString(16).padStart(2, "0").toUpperCase();
    if (trailingH) result += "h";

    return result;
  }
}

export type IOAddressLike = IOAddress | AnyByte | number;
