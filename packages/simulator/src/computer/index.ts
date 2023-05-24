import type { Register, WordRegister } from "@vonsim/assembler";
import { MemoryAddress, MemoryAddressLike } from "@vonsim/common/address";
import { Byte } from "@vonsim/common/byte";

import { SimulatorError } from "../error";

type RegisterMap = { [key in WordRegister]: Byte };

type Flag =
  | "CF" // Carry Flag
  | "ZF" // Zero Flag
  | "SF" // Sign Flag
  | "IF" // Interrupt Flag
  | "OF"; // Overflow Flag

export class Computer {
  #memory: DataView;
  #reservedMemory: Set<number>;
  #registers: Record<WordRegister, Byte>;
  #flags: Record<Flag, boolean> = { CF: false, ZF: false, SF: false, IF: false, OF: false };

  // Initial memory address
  #IP = MemoryAddress.from(0x2000);

  constructor(initial: {
    memory: ArrayBuffer;
    reservedMemory: Set<number>;
    registers: RegisterMap;
  }) {
    this.#memory = new DataView(
      initial.memory.slice(MemoryAddress.MIN_ADDRESS, MemoryAddress.MAX_ADDRESS + 1),
    );
    this.#reservedMemory = structuredClone(initial.reservedMemory);
    this.#registers = { ...initial.registers };
  }

  /**
   * Gets a byte from memory at the specified address.
   * @param address The address to get the byte from.
   * @returns The byte at the specified address (always 8-bit).
   */
  getMemory(address: MemoryAddressLike): Byte {
    address = Number(address);

    if (!MemoryAddress.inRange(address)) {
      throw new SimulatorError("address-out-of-range", address);
    }

    const unsigned = this.#memory.getUint8(address);
    return Byte.fromUnsigned(unsigned, 8);
  }

  /**
   * Gets a byte from memory at the specified address.
   * @param address The address to get the byte from.
   * @returns The byte at the specified address (always 8-bit).
   */
  setMemory(address: MemoryAddressLike, value: Byte): void {
    address = Number(address);

    if (!MemoryAddress.inRange(address)) {
      throw new SimulatorError("address-out-of-range", address);
    }

    if (this.#reservedMemory.has(address)) {
      throw new SimulatorError("address-has-instruction", address);
    }

    this.#memory.setUint8(address, value.lowByte.unsigned);
  }

  /**
   * Gets the value of the specified register.
   * @param register Either a full register or a partial register (like AL for the low part of AX).
   * @returns The value of the register.
   */
  getRegister(register: Register): Byte {
    switch (register) {
      case "AL":
        return this.#registers.AX.lowByte;
      case "AH":
        return this.#registers.AX.highByte;
      case "BL":
        return this.#registers.BX.lowByte;
      case "BH":
        return this.#registers.BX.highByte;
      case "CL":
        return this.#registers.CX.lowByte;
      case "CH":
        return this.#registers.CX.highByte;
      case "DL":
        return this.#registers.DX.lowByte;
      case "DH":
        return this.#registers.DX.highByte;
      default:
        return this.#registers[register];
    }
  }

  /**
   * Sets the value of the specified register.
   * If the value size is different from the register size, an error is thrown.
   * @param register Either a full register or a partial register (like AL for the low part of AX).
   * @param value The value to set.
   */
  setRegister(register: Register, value: Byte): void {
    switch (register) {
      case "AL":
        this.#registers.AX = this.#registers.AX.withLowByte(value);
        break;
      case "AH":
        this.#registers.AX = this.#registers.AX.withHighByte(value);
        break;
      case "BL":
        this.#registers.BX = this.#registers.BX.withLowByte(value);
        break;
      case "BH":
        this.#registers.BX = this.#registers.BX.withHighByte(value);
        break;
      case "CL":
        this.#registers.CX = this.#registers.CX.withLowByte(value);
        break;
      case "CH":
        this.#registers.CX = this.#registers.CX.withHighByte(value);
        break;
      case "DL":
        this.#registers.DX = this.#registers.DX.withLowByte(value);
        break;
      case "DH":
        this.#registers.DX = this.#registers.DX.withHighByte(value);
        break;
      default:
        if (this.#registers[register].size !== value.size) {
          throw new TypeError(
            `Cannot set register ${register} with value ${value} of different size`,
          );
        }
        this.#registers[register] = value;
        break;
    }
  }

  /**
   * Returns the value of the specified flag.
   * @see /docs/especificaciones/codificacion.md
   */
  getFlag(flag: Flag): boolean {
    return this.#flags[flag];
  }

  /**
   * Sets the value of the specified flag.
   * @see /docs/especificaciones/codificacion.md
   */
  setFlag(flag: Flag, value: boolean): void {
    this.#flags[flag] = value;
  }

  /**
   * Gets the FLAGS register.
   * @see /docs/especificaciones/codificacion.md
   */
  get FLAGS(): Byte {
    let byte = 0;
    if (this.#flags.CF) byte |= 1;
    if (this.#flags.ZF) byte |= 1 << 6;
    if (this.#flags.SF) byte |= 1 << 7;
    if (this.#flags.IF) byte |= 1 << 9;
    if (this.#flags.OF) byte |= 1 << 11;
    return Byte.fromUnsigned(byte, 16);
  }

  /**
   * Sets the flags from the FLAGS register.
   * @see /docs/especificaciones/codificacion.md
   */
  set FLAGS(reg: Byte) {
    this.#flags.CF = reg.bit(0);
    this.#flags.ZF = reg.bit(6);
    this.#flags.SF = reg.bit(7);
    this.#flags.IF = reg.bit(9);
    this.#flags.OF = reg.bit(11);
  }
}
