import type { ByteRegister, Register, WordRegister } from "@vonsim/assembler";
import { MemoryAddress, MemoryAddressLike } from "@vonsim/common/address";
import { AnyByte, Byte } from "@vonsim/common/byte";
import type { JsonValue } from "type-fest";

import { Component, ComponentInit } from "../component";
import { SimulatorError } from "../error";
import type { EventGenerator } from "../events";
import { InstructionType, statementToInstruction } from "./instructions";

type Flag =
  | "CF" // Carry Flag
  | "ZF" // Zero Flag
  | "SF" // Sign Flag
  | "IF" // Interrupt Flag
  | "OF"; // Overflow Flag

export class CPU extends Component {
  #instructions: Map<number, InstructionType>;

  #registers: Record<WordRegister, Byte<16>>;
  #flags: Record<Flag, boolean>;
  #IP: MemoryAddress;

  constructor(options: ComponentInit) {
    super(options);

    const SP = Byte.fromUnsigned(MemoryAddress.MAX_ADDRESS + 1, 16);
    const IF = true;

    if (options.data === "unchanged") {
      this.#registers = options.previous.cpu.#registers;
      this.#registers.SP = SP;
      this.#flags = options.previous.cpu.#flags;
      this.#flags.IF = true;
    } else if (options.data === "randomize") {
      this.#registers = {
        AX: Byte.random(16),
        BX: Byte.random(16),
        CX: Byte.random(16),
        DX: Byte.random(16),
        SP,
      };
      this.#flags = {
        CF: Math.random() > 0.5,
        ZF: Math.random() > 0.5,
        SF: Math.random() > 0.5,
        IF,
        OF: Math.random() > 0.5,
      };
    } else {
      this.#registers = {
        AX: Byte.zero(16),
        BX: Byte.zero(16),
        CX: Byte.zero(16),
        DX: Byte.zero(16),
        SP,
      };
      this.#flags = { CF: false, ZF: true, SF: false, IF, OF: false };
    }

    this.#IP = MemoryAddress.from(0x2000);

    this.#instructions = new Map();
    for (const statement of options.program.instructions) {
      const instruction = statementToInstruction(statement);
      this.#instructions.set(instruction.start.value, instruction);
    }
  }

  /**
   * CPU runner.
   * Executes one instruction at a time, yielding the micro-operations that it will execute.
   */
  *run(): EventGenerator {
    while (true) {
      const instruction = this.#instructions.get(this.#IP.value);
      if (!instruction) {
        yield { type: "cpu:error", error: new SimulatorError("no-instruction", this.#IP) };
        return;
      }
      const continueExecuting = yield* instruction.execute(this.computer);
      if (!continueExecuting) return;

      // Check for interrupts
      if (this.getFlag("IF") && this.computer.io.pic.isINTRActive()) {
        yield { type: "cpu:cycle.update", phase: "interrupt" };
        const intn = yield* this.computer.io.pic.handleINTR();
        yield { type: "cpu:mbr.get", register: "ri.l" };
        yield { type: "cpu:register.update", register: "ri.h", value: Byte.zero(8) };
        yield* this.startInterrupt(intn);
      }

      yield { type: "cpu:cycle.end" };
    }
  }

  /**
   * Gets the value of the specified register.
   * @param register Either a full register or a partial register (like AL for the low part of AX).
   * @returns The value of the register.
   */
  getRegister(register: ByteRegister): Byte<8>;
  getRegister(register: WordRegister): Byte<16>;
  getRegister(register: Register): AnyByte {
    switch (register) {
      case "AL":
        return this.#registers.AX.low;
      case "AH":
        return this.#registers.AX.high;
      case "BL":
        return this.#registers.BX.low;
      case "BH":
        return this.#registers.BX.high;
      case "CL":
        return this.#registers.CX.low;
      case "CH":
        return this.#registers.CX.high;
      case "DL":
        return this.#registers.DX.low;
      case "DH":
        return this.#registers.DX.high;
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
  setRegister(register: ByteRegister, value: Byte<8>): void;
  setRegister(register: WordRegister, value: Byte<16>): void;
  setRegister(register: Register, value: AnyByte): void {
    switch (register) {
      case "AL": {
        if (value.size !== 8) {
          throw new TypeError(
            `Cannot set register ${register} with value ${value} of different size`,
          );
        }
        this.#registers.AX = this.#registers.AX.withLow(value);
        return;
      }

      case "AH": {
        if (value.size !== 8) {
          throw new TypeError(
            `Cannot set register ${register} with value ${value} of different size`,
          );
        }
        this.#registers.AX = this.#registers.AX.withHigh(value);
        return;
      }

      case "BL": {
        if (value.size !== 8) {
          throw new TypeError(
            `Cannot set register ${register} with value ${value} of different size`,
          );
        }
        this.#registers.BX = this.#registers.BX.withLow(value);
        return;
      }

      case "BH": {
        if (value.size !== 8) {
          throw new TypeError(
            `Cannot set register ${register} with value ${value} of different size`,
          );
        }
        this.#registers.BX = this.#registers.BX.withHigh(value);
        return;
      }

      case "CL": {
        if (value.size !== 8) {
          throw new TypeError(
            `Cannot set register ${register} with value ${value} of different size`,
          );
        }
        this.#registers.CX = this.#registers.CX.withLow(value);
        return;
      }

      case "CH": {
        if (value.size !== 8) {
          throw new TypeError(
            `Cannot set register ${register} with value ${value} of different size`,
          );
        }
        this.#registers.CX = this.#registers.CX.withHigh(value);
        return;
      }

      case "DL": {
        if (value.size !== 8) {
          throw new TypeError(
            `Cannot set register ${register} with value ${value} of different size`,
          );
        }
        this.#registers.DX = this.#registers.DX.withLow(value);
        return;
      }

      case "DH": {
        if (value.size !== 8) {
          throw new TypeError(
            `Cannot set register ${register} with value ${value} of different size`,
          );
        }
        this.#registers.DX = this.#registers.DX.withHigh(value);
        return;
      }

      default: {
        if (value.size !== 16) {
          throw new TypeError(
            `Cannot set register ${register} with value ${value} of different size`,
          );
        }
        this.#registers[register] = value;
        return;
      }
    }
  }

  /**
   * Returns the value of the instruction pointer.
   */
  getIP(): MemoryAddress {
    return this.#IP;
  }

  /**
   * Updates the value of the instruction pointer.
   * @param address The new value of the instruction pointer.
   */
  setIP(address: MemoryAddressLike): MemoryAddress {
    return (this.#IP = MemoryAddress.from(address));
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
  get FLAGS(): Byte<16> {
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
  set FLAGS(reg: Byte<16>) {
    this.#flags.CF = reg.bit(0);
    this.#flags.ZF = reg.bit(6);
    this.#flags.SF = reg.bit(7);
    this.#flags.IF = reg.bit(9);
    this.#flags.OF = reg.bit(11);
  }

  /**
   * Pushes a value to the stack, and updates the SP register.
   * This value should have been previously written to the id register.
   * @param value The value to push to the stack.
   * @returns Whether the operation was successful.
   */
  *pushToStack(value: Byte<16>): EventGenerator<boolean> {
    let SP = this.getRegister("SP");

    if (!MemoryAddress.inRange(SP.unsigned - 1)) {
      yield { type: "cpu:error", error: new SimulatorError("stack-overflow") };
      return false;
    }
    SP = SP.add(-1);
    yield { type: "cpu:register.update", register: "SP", value: SP };
    yield { type: "cpu:mar.set", register: "SP" };
    yield { type: "cpu:mbr.set", register: "id.h" };
    if (!(yield* this.computer.memory.write(SP, value.high))) return false; // Error writing memory

    if (!MemoryAddress.inRange(SP.unsigned - 1)) {
      yield { type: "cpu:error", error: new SimulatorError("stack-overflow") };
      return false;
    }
    SP = SP.add(-1);
    yield { type: "cpu:register.update", register: "SP", value: SP };
    yield { type: "cpu:mar.set", register: "SP" };
    yield { type: "cpu:mbr.set", register: "id.l" };
    if (!(yield* this.computer.memory.write(SP, value.low))) return false; // Error writing memory

    return true;
  }

  /**
   * Pops a value from the stack, and updates the SP register.
   * This value will be written to the id register.
   * @returns The value popped from the stack (16 bits), or `null` if the operation was unsuccessful.
   */
  *popFromStack(): EventGenerator<Byte<16> | null> {
    let SP = this.getRegister("SP");

    if (!MemoryAddress.inRange(SP)) {
      yield { type: "cpu:error", error: new SimulatorError("stack-underflow") };
      return null;
    }
    yield { type: "cpu:mar.set", register: "SP" };
    const low = yield* this.computer.memory.read(SP);
    if (!low) return null; // Error reading memory
    yield { type: "cpu:mbr.get", register: "id.l" };
    SP = SP.add(1);
    yield { type: "cpu:register.update", register: "SP", value: SP };

    if (!MemoryAddress.inRange(SP)) {
      yield { type: "cpu:error", error: new SimulatorError("stack-underflow") };
      return null;
    }
    yield { type: "cpu:mar.set", register: "SP" };
    const high = yield* this.computer.memory.read(SP);
    if (!high) return null; // Error reading memory
    yield { type: "cpu:mbr.get", register: "id.h" };
    SP = SP.add(1);
    yield { type: "cpu:register.update", register: "SP", value: SP };

    return low.withHigh(high);
  }

  /**
   * Starts an interrupt routine.
   * The interrupt number should have been previously written to the ri register.
   *
   * This function will push the FLAGS and IP registers to the stack, and set the IF flag to false.
   * Then, will get the interrupt routine address from the interrupt vector table, and set the IP register to that address.
   *
   * @param number The interrupt number (0-255).
   */
  *startInterrupt(number: Byte<8>): EventGenerator<boolean> {
    yield { type: "cpu:register.copy", input: "FLAGS", output: "id" };
    if (!(yield* this.pushToStack(this.FLAGS))) return false; // Stack overflow
    this.setFlag("IF", false);
    yield { type: "cpu:register.update", register: "FLAGS", value: this.FLAGS };
    yield { type: "cpu:register.copy", input: "IP", output: "id" };
    if (!(yield* this.pushToStack(this.#IP.byte))) return false; // Stack overflow

    let vector = MemoryAddress.from(number.unsigned * 4);
    yield { type: "cpu:register.update", register: "ri", value: vector.byte };
    yield { type: "cpu:mar.set", register: "ri" };

    const low = yield* this.computer.memory.read(vector);
    if (!low) return false; // Error reading memory
    yield { type: "cpu:mbr.get", register: "id.l" };
    vector = MemoryAddress.from(vector.value + 1);
    const high = yield* this.computer.memory.read(vector);
    if (!high) return false; // Error reading memory
    yield { type: "cpu:mbr.get", register: "id.h" };

    this.setIP(low.withHigh(high));
    yield { type: "cpu:register.update", register: "IP", value: this.#IP.byte };

    return true;
  }

  toJSON(): JsonValue {
    return {
      AX: this.#registers.AX.toJSON(),
      BX: this.#registers.AX.toJSON(),
      CX: this.#registers.AX.toJSON(),
      DX: this.#registers.AX.toJSON(),
      SP: this.#registers.AX.toJSON(),
      IP: this.#IP.toJSON(),
      FLAGS: this.FLAGS.toJSON(),
    };
  }
}
