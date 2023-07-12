import { unassigned } from "@vonsim/assembler";
import { MemoryAddress, MemoryAddressLike } from "@vonsim/common/address";
import { Byte } from "@vonsim/common/byte";
import type { JsonValue } from "type-fest";

import { Component, ComponentInit } from "./component";
import { SimulatorError } from "./error";
import type { EventGenerator } from "./events";

export type MemoryOperation =
  | { type: "memory:read"; address: MemoryAddressLike }
  | { type: "memory:read.ok"; value: Byte<8> }
  | { type: "memory:read.error"; error: SimulatorError<"address-out-of-range"> }
  | { type: "memory:write"; address: MemoryAddressLike; value: Byte<8> }
  | { type: "memory:write.ok" }
  | {
      type: "memory:write.error";
      error: SimulatorError<"address-has-instruction"> | SimulatorError<"address-out-of-range">;
    };

export class Memory extends Component {
  static readonly SIZE = MemoryAddress.MAX_ADDRESS + 1;

  #buffer: Uint8Array;
  #reservedMemory: Set<number>;

  constructor(options: ComponentInit) {
    super(options);
    if (options.data === "unchanged") {
      this.#buffer = options.previous.memory.#buffer;
    } else if (options.data === "randomize") {
      this.#buffer = new Uint8Array(Memory.SIZE).map(() => Byte.random(8).unsigned);
    } else {
      this.#buffer = new Uint8Array(Memory.SIZE);
    }

    for (const directive of options.program.data) {
      let offset = directive.start.value;
      for (const value of directive.getValues()) {
        if (value !== unassigned) this.#buffer.set(value.toUint8Array(), offset);
        offset += directive.size / 8;
      }
    }

    this.#reservedMemory = new Set();
    for (const instruction of options.program.instructions) {
      this.#buffer.set(instruction.toBytes(), instruction.start.value);
      for (let i = 0; i < instruction.length; i++) {
        this.#reservedMemory.add(instruction.start.value + i);
      }
    }
  }

  /**
   * Reads a byte from memory at the specified address.
   * @param address The address to read the byte from.
   * @returns The byte at the specified address (always 8-bit) or null if there was an error.
   */
  *read(address: MemoryAddressLike): EventGenerator<Byte<8> | null> {
    address = Number(address);
    yield { type: "memory:read", address };

    if (!MemoryAddress.inRange(address)) {
      yield {
        type: "memory:read.error",
        error: new SimulatorError("address-out-of-range", address),
      };
      return null;
    }

    const value = Byte.fromUnsigned(this.#buffer.at(address)!, 8);
    yield { type: "memory:read.ok", value };
    return value;
  }

  /**
   * Writes a byte to memory at the specified address.
   * @param address The address to write the byte to.
   * @param value The byte to write.
   * @returns Whether the operation succedeed or not (boolean).
   */
  *write(address: MemoryAddressLike, value: Byte<8>): EventGenerator<boolean> {
    address = Number(address);
    yield { type: "memory:write", address, value };

    if (!MemoryAddress.inRange(address)) {
      yield {
        type: "memory:write.error",
        error: new SimulatorError("address-out-of-range", address),
      };
      return false;
    }

    if (this.#reservedMemory.has(address)) {
      yield {
        type: "memory:write.error",
        error: new SimulatorError("address-has-instruction", address),
      };
      return false;
    }

    this.#buffer.set([value.unsigned], address);
    yield { type: "memory:write.ok" };
    return true;
  }

  toJSON() {
    return [...this.#buffer] satisfies JsonValue;
  }
}
