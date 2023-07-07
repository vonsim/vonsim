import type { Instruction as InstructionName, InstructionStatement } from "@vonsim/assembler";
import type { MemoryAddress } from "@vonsim/common/address";
import type { Position } from "@vonsim/common/position";

import type { Computer } from "../computer";
import { SimulatorError } from "../error";
import type { EventGenerator } from "../events";
import type { Physical8bitsRegisters } from "./micro-ops";

/**
 * Represents an instruction that can be executed by the CPU.
 *
 * Each implementation of this class represents a different instruction or
 * set of instructions.
 *
 * The `execute` method returns a generator that yields the micro-operations
 * that the CPU will execute.
 *
 * This abstract class also contains some helper methods for each implementation.
 */
export abstract class Instruction<TInstruction extends InstructionName> {
  constructor(protected readonly statement: InstructionStatement & { instruction: TInstruction }) {}

  get name(): TInstruction {
    return this.statement.instruction;
  }

  get start(): MemoryAddress {
    return this.statement.start;
  }

  get position(): Position {
    return this.statement.position;
  }

  /**
   * Executes the instruction.
   * Returns a generator that yields the micro-operations that the CPU will execute.
   * Once the generator is done, it returns either `true` or `false` depending on whether the program should keep running or not.
   * @param computer The computer that will execute the instruction.
   */
  abstract execute(computer: Computer): EventGenerator<boolean>;

  /**
   * Consumes one byte of the instruction from memory (aka, where the IP is pointing to)
   * and stores it in the destination register. At the end, the IP is incremented by one.
   * @param computer The computer that will execute the instruction.
   * @param dest Which register to store the byte in.
   */
  protected *consumeInstruction(computer: Computer, dest: Physical8bitsRegisters): EventGenerator {
    let IP = computer.cpu.getIP();
    yield { type: "cpu:mar.set", register: "IP" };

    const byte = yield* computer.memory.read(IP);
    if (!byte) {
      throw new SimulatorError(
        "unexpected-error",
        `Could not read instruction byte at address ${IP.value}`,
      );
    }

    IP = computer.cpu.setIP(IP.value + 1);
    yield { type: "cpu:register.update", register: "IP", value: IP.byte };
    yield { type: "cpu:mbr.get", register: dest };
  }
}
