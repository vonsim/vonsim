/**
 * This is a bridge between the CPU and the Memory.
 *
 * It handles registers like MAR and MBR, and also some
 * "higer level" operations like pushing to the stack.
 */

import { Err, Ok } from "rust-optionals";

import { MAX_MEMORY_ADDRESS, MIN_MEMORY_ADDRESS, Size } from "@/config";
import { SimulatorError, SimulatorResult } from "@/simulator/common";
import type { Memory } from "@/simulator/memory";

import type { Registers } from "./registers";

export class MemoryLink {
  #memory: Memory;
  #registers: Registers;

  constructor(memory: Memory, registers: Registers) {
    this.#memory = memory;
    this.#registers = registers;
  }

  get(address: number, size: Size): SimulatorResult<number> {
    this.#registers.set("MAR", address);

    const result = this.#memory.get(address, size);

    if (result.isOk()) this.#registers.set("MBR", result.unwrap());
    return result;
  }

  set(address: number, size: Size, value: number): SimulatorResult<void> {
    this.#registers.set("MAR", address);
    this.#registers.set("MBR", value);
    return this.#memory.set(address, size, value);
  }

  pushToStack(value: number): SimulatorResult<void> {
    let SP = this.#registers.get("SP");
    SP -= 2;
    if (SP < MIN_MEMORY_ADDRESS) return Err(new SimulatorError("stack-overflow"));
    this.#registers.set("SP", SP);

    const saved = this.set(SP, "word", value);
    if (saved.isErr()) return Err(saved.unwrapErr());

    return Ok();
  }

  popFromStack(): SimulatorResult<number> {
    let SP = this.#registers.get("SP");

    const value = this.get(SP, "word");
    if (value.isErr()) return Err(value.unwrapErr());

    SP += 2;
    if (SP > MAX_MEMORY_ADDRESS + 1) return Err(new SimulatorError("stack-underflow"));
    this.#registers.set("SP", SP);

    return value;
  }
}
