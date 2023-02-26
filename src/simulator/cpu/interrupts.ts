import { Err, Ok } from "rust-optionals";
import { isMatching } from "ts-pattern";

import { interruptPattern } from "@/compiler/common/patterns";
import { INTERRUPT_VECTOR_ADDRESS_SIZE } from "@/config";
import { Jsonable, SimulatorError, SimulatorResult } from "@/simulator/common";
import type { IOInterface } from "@/simulator/io";

import type { ALU } from "./alu";
import type { MemoryLink } from "./memory-link";
import type { Registers } from "./registers";

export class Interrupts implements Jsonable {
  #memory: MemoryLink;
  #registers: Registers;
  #io: IOInterface;
  #alu: ALU;

  constructor(props: { memory: MemoryLink; registers: Registers; io: IOInterface; alu: ALU }) {
    this.#memory = props.memory;
    this.#registers = props.registers;
    this.#io = props.io;
    this.#alu = props.alu;
  }

  public enabled = true;

  reset() {
    this.enabled = true;
  }

  /**
   * Checks if there are any interrupts to handle and handles them.
   * @see /docs/como-usar/interrupciones-por-hardware.md for more details
   */
  checkInterrupts(): SimulatorResult<void> {
    if (!this.enabled) return Ok();

    const nextInterrupt = this.#io.devices.pic.handleNextInterrupt();
    if (nextInterrupt.isNone()) return Ok();

    const id = nextInterrupt.unwrap();
    if (isMatching(interruptPattern, id)) {
      return Err(new SimulatorError("reserved-interrupt", id));
    }

    const address = this.#memory.get(id * INTERRUPT_VECTOR_ADDRESS_SIZE, "word");
    if (address.isErr()) return Err(address.unwrapErr());

    const flags = this.#memory.pushToStack(this.#alu.encodeFlags());
    if (flags.isErr()) return Err(flags.unwrapErr());

    const IP = this.#memory.pushToStack(this.#registers.get("IP"));
    if (IP.isErr()) return Err(IP.unwrapErr());

    this.#registers.set("IP", address.unwrap());

    return Ok();
  }

  /**
   * Handles the char received after an INT 6 instruction.
   * @see /docs/como-usar/interrupciones-por-software.md for more details
   */
  handleInt6(char: string): SimulatorResult<void> {
    const address = this.#registers.get("BX");

    const saved = this.#memory.set(address, "byte", char.charCodeAt(0));
    if (saved.isErr()) return Err(saved.unwrapErr());

    this.#io.devices.console.write(char);
    return Ok();
  }

  toJSON() {
    return this.enabled;
  }
}
