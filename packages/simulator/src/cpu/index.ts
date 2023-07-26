import { MemoryAddress } from "@vonsim/common/address";
import { AnyByte, Byte } from "@vonsim/common/byte";
import type { Split } from "type-fest";

import { Component, ComponentInit } from "../component";
import { SimulatorError } from "../error";
import type { EventGenerator } from "../events";
import { InstructionType, statementToInstruction } from "./instructions";
import type {
  ByteRegister,
  Flag,
  MARRegister,
  PartialFlags,
  Register,
  RegistersMap,
  WordRegister,
} from "./types";

/**
 * The CPU.
 * @see {@link https://vonsim.github.io/docs/cpu/}
 *
 * It has internal registers, a memory address buffer (MAR) and a
 * memory buffer register (MBR).
 *
 * It also stores the instructions of the program. This is done to avoid
 * having to read the program from memory every time an instruction is executed,
 * which would be very inefficient.
 *
 * The function that executes the instructions is {@link CPU.run}.
 */
export class CPU extends Component {
  #instructions: Map<number, InstructionType>;
  #registers: RegistersMap;
  #MAR: Byte<16>;
  #MBR: Byte<8>;

  constructor(options: ComponentInit) {
    super(options);

    if (options.data === "unchanged") {
      this.#registers = options.previous.cpu.#registers;
      this.#MAR = options.previous.cpu.#MAR;
      this.#MBR = options.previous.cpu.#MBR;
    } else if (options.data === "randomize") {
      this.#registers = {
        AX: Byte.random(16),
        BX: Byte.random(16),
        CX: Byte.random(16),
        DX: Byte.random(16),
        SP: Byte.random(16),
        IP: Byte.random(16),
        IR: Byte.random(8),
        ri: Byte.random(16),
        id: Byte.random(16),
        left: Byte.random(16),
        right: Byte.random(16),
        result: Byte.random(16),
        FLAGS: Byte.random(16),
      };
      this.#MAR = Byte.random(16);
      this.#MBR = Byte.random(8);
    } else {
      this.#registers = {
        AX: Byte.zero(16),
        BX: Byte.zero(16),
        CX: Byte.zero(16),
        DX: Byte.zero(16),
        SP: Byte.zero(16),
        IP: Byte.zero(16),
        IR: Byte.zero(8),
        ri: Byte.zero(16),
        id: Byte.zero(16),
        left: Byte.zero(16),
        right: Byte.zero(16),
        result: Byte.zero(16),
        FLAGS: Byte.zero(16),
      };
      this.#MAR = Byte.zero(16);
      this.#MBR = Byte.zero(8);
    }

    // Stack pointer starts at the "bottom" of the memory
    this.#registers.SP = Byte.fromUnsigned(MemoryAddress.MAX_ADDRESS + 1, 16);
    // The initial address of the program is 0x2000
    this.#registers.IP = Byte.fromUnsigned(0x2000, 16);
    // Interrupts always enabled at the start
    this.#setFlag("IF", true);

    this.#instructions = new Map();
    for (const statement of options.program.instructions) {
      const instruction = statementToInstruction(statement);
      this.#instructions.set(instruction.start.value, instruction);
    }
  }

  /**
   * CPU runner.
   * Executes one instruction at a time, yielding the micro-operations that it will execute.
   *
   * ---
   * Called by the Computer.
   */
  *run(): EventGenerator {
    // Infinite loop until computer halts
    while (true) {
      // Gets the instruction at the current IP from `this.#instructions`
      const instruction = this.#instructions.get(this.#registers.IP.unsigned);
      if (!instruction) {
        yield {
          type: "cpu:error",
          error: new SimulatorError("no-instruction", this.#registers.IP),
        };
        return;
      }

      // Execute the instruction, and checks if the instruction returned `false` (halt)
      const continueExecuting = yield* instruction.execute(this.computer);
      if (!continueExecuting) return;

      // Check for interrupts
      if (this.getFlag("IF") && this.computer.io.pic.isINTRActive()) {
        // Start interrupt phase
        yield { type: "cpu:cycle.interrupt" };
        const intn = yield* this.computer.io.pic.handleINTR();
        yield* this.getMBR("ri.l");
        yield* this.updateByteRegister("ri.h", Byte.zero(8));
        yield* this.startInterrupt(intn);
      }

      // End cycle and repeat
      yield { type: "cpu:cycle.end" };
    }
  }

  /**
   * Starts an interrupt routine.
   * The interrupt number should have been previously written to the ri register.
   *
   * This function will push the FLAGS and IP registers to the stack, and set the IF flag to false.
   * Then, will get the interrupt routine address from the interrupt vector table, and set the IP register to that address.
   *
   * @see {@link https://vonsim.github.io/docs/cpu/#interrupciones}
   *
   * @param number The interrupt number (0-255).
   *
   * ---
   * Called by the CPU ({@link CPU.run}).
   */
  *startInterrupt(number: Byte<8>): EventGenerator<boolean> {
    // Save machine state
    yield* this.copyWordRegister("FLAGS", "id");
    if (!(yield* this.pushToStack())) return false; // Stack overflow
    yield* this.updateFLAGS({ IF: false });
    yield* this.copyWordRegister("IP", "id");
    if (!(yield* this.pushToStack())) return false; // Stack overflow

    // Get interrupt routine address low
    let vector = Byte.fromUnsigned(number.unsigned * 4, 16);
    yield* this.updateWordRegister("ri", vector);
    yield* this.setMAR("ri");
    if (!(yield* this.useBus("mem-read"))) return false; // Error reading memory
    yield* this.getMBR("id.l");

    // Get interrupt routine address high
    vector = vector.add(1);
    yield* this.updateWordRegister("ri", vector);
    yield* this.setMAR("ri");
    if (!(yield* this.useBus("mem-read"))) return false; // Error reading memory
    yield* this.getMBR("id.h");

    // Update IP
    yield* this.copyWordRegister("id", "IP");
    return true;
  }

  toJSON() {
    return Object.entries(this.#registers).reduce(
      (acc, [reg, value]) => ({ ...acc, [reg]: value.toJSON() }),
      {} as { [key in keyof RegistersMap]: number },
    );
  }

  // #=========================================================================#
  // # Register methods                                                        #
  // #=========================================================================#

  /**
   * Given a register name, returns the physical register and the part of the register
   * specified (low, high or none).
   * @internal
   * @param register
   * @returns a tuple with the register name and the part of the register (low, high or none).
   */
  #parseRegister(register: Register): [reg: keyof RegistersMap, part: "low" | "high" | null] {
    switch (register) {
      case "AL":
        return ["AX", "low"];
      case "AH":
        return ["AX", "high"];
      case "BL":
        return ["BX", "low"];
      case "BH":
        return ["BX", "high"];
      case "CL":
        return ["CX", "low"];
      case "CH":
        return ["CX", "high"];
      case "DL":
        return ["DX", "low"];
      case "DH":
        return ["DX", "high"];
      default: {
        const [reg, part] = register.split(".") as Split<typeof register, ".">;
        return [reg, part === "l" ? "low" : part === "h" ? "high" : null];
      }
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
    const [reg, part] = this.#parseRegister(register);
    if (part === "low") return this.#registers[reg].low;
    else if (part === "high") return this.#registers[reg].high;
    else return this.#registers[reg];
  }

  /**
   * Sets the value of the specified register.
   * If the value size is different from the register size, an error is thrown.
   * @internal
   * @param register Either a full register or a partial register (like AL for the low part of AX).
   * @param value The value to set.
   */
  #setRegister(register: ByteRegister, value: Byte<8>): void;
  #setRegister(register: WordRegister, value: Byte<16>): void;
  #setRegister(register: Register, value: AnyByte): void {
    const [reg, part] = this.#parseRegister(register);
    if (part === null) {
      if (this.#registers[reg].size !== value.size) {
        throw new TypeError(
          `Cannot set register ${register} with value ${value} of different size`,
        );
      }
      (this.#registers[reg] as AnyByte) = value;
    } else {
      if (!value.is8bits()) {
        throw new TypeError(
          `Cannot set register ${register} with value ${value} of different size`,
        );
      }
      if (part === "low") (this.#registers[reg] as AnyByte) = this.#registers[reg].withLow(value);
      else (this.#registers[reg] as AnyByte) = this.#registers[reg].withHigh(value);
    }
  }

  /**
   * Copies the value of a byte register to another byte register.
   *
   * ---
   * Called by the instructions ({@link InstructionType.execute}) and the CPU.
   */
  *copyByteRegister(src: ByteRegister, dest: ByteRegister): EventGenerator {
    const value = this.getRegister(src);
    this.#setRegister(dest, value);
    yield { type: "cpu:register.copy", size: 8, src, dest };
  }

  /**
   * Copies the value of a word register to another word register.
   *
   * ---
   * Called by the instructions ({@link InstructionType.execute}) and the CPU.
   */
  *copyWordRegister(src: WordRegister, dest: WordRegister): EventGenerator {
    const value = this.getRegister(src);
    this.#setRegister(dest, value);
    yield { type: "cpu:register.copy", size: 16, src, dest };
  }

  /**
   * Updates the value of a byte register.
   *
   * ---
   * Called by the instructions ({@link InstructionType.execute}) and the CPU.
   */
  *updateByteRegister(
    register: ByteRegister,
    value: Byte<8> | ((prev: Byte<8>) => Byte<8>),
  ): EventGenerator {
    value = typeof value === "function" ? value(this.getRegister(register)) : value;
    this.#setRegister(register, value);
    yield { type: "cpu:register.update", size: 8, register, value };
  }

  /**
   * Updates the value of a word register.
   *
   * ---
   * Called by the instructions ({@link InstructionType.execute}) and the CPU.
   */
  *updateWordRegister(
    register: WordRegister,
    value: Byte<16> | ((prev: Byte<16>) => Byte<16>),
  ): EventGenerator {
    value = typeof value === "function" ? value(this.getRegister(register)) : value;
    this.#setRegister(register, value);
    yield { type: "cpu:register.update", size: 16, register, value };
  }

  // #=========================================================================#
  // # Flags methods                                                           #
  // #=========================================================================#

  /**
   * Returns the value of the specified flag.
   * @see {@link https://vonsim.github.io/docs/cpu/#flags}
   */
  getFlag(flag: Flag): boolean {
    switch (flag) {
      case "CF":
        return this.#registers.FLAGS.bit(0);
      case "ZF":
        return this.#registers.FLAGS.bit(6);
      case "SF":
        return this.#registers.FLAGS.bit(7);
      case "IF":
        return this.#registers.FLAGS.bit(9);
      case "OF":
        return this.#registers.FLAGS.bit(11);
      default:
        throw new TypeError(`Invalid flag ${flag}`);
    }
  }

  /**
   * Sets the value of the specified flag.
   * @internal
   * @see {@link https://vonsim.github.io/docs/cpu/#flags}
   */
  #setFlag(flag: Flag, value: boolean): void {
    switch (flag) {
      case "CF":
        this.#registers.FLAGS = this.#registers.FLAGS.withBit(0, value);
        return;
      case "ZF":
        this.#registers.FLAGS = this.#registers.FLAGS.withBit(6, value);
        return;
      case "SF":
        this.#registers.FLAGS = this.#registers.FLAGS.withBit(7, value);
        return;
      case "IF":
        this.#registers.FLAGS = this.#registers.FLAGS.withBit(9, value);
        return;
      case "OF":
        this.#registers.FLAGS = this.#registers.FLAGS.withBit(11, value);
        return;
      default:
        throw new TypeError(`Invalid flag ${flag}`);
    }
  }

  /**
   * Updates the FLAGS register.
   * @param flags The flags to update. If a flag is not specified, it will not be updated.
   *
   * ---
   * Called by the instructions ({@link InstructionType.execute}) and the CPU.
   */
  *updateFLAGS(flags: PartialFlags): EventGenerator {
    if (typeof flags.CF === "boolean") this.#setFlag("CF", flags.CF);
    if (typeof flags.ZF === "boolean") this.#setFlag("ZF", flags.ZF);
    if (typeof flags.SF === "boolean") this.#setFlag("SF", flags.SF);
    if (typeof flags.IF === "boolean") this.#setFlag("IF", flags.IF);
    if (typeof flags.OF === "boolean") this.#setFlag("OF", flags.OF);
    yield {
      type: "cpu:register.update",
      size: 16,
      register: "FLAGS",
      value: this.#registers.FLAGS,
    };
  }

  /**
   * Updates the FLAGS register.
   * @param flags The flags to update. If a flag is not specified, it will not be updated.
   *
   * ---
   * Called by the instructions ({@link InstructionType.execute}) and the CPU.
   */
  *aluExecute(operation: string, result: AnyByte, flags: PartialFlags): EventGenerator {
    this.#registers.result = result.is8bits() ? this.#registers.result.withLow(result) : result;
    if (typeof flags.CF === "boolean") this.#setFlag("CF", flags.CF);
    if (typeof flags.ZF === "boolean") this.#setFlag("ZF", flags.ZF);
    if (typeof flags.SF === "boolean") this.#setFlag("SF", flags.SF);
    if (typeof flags.IF === "boolean") this.#setFlag("IF", flags.IF);
    if (typeof flags.OF === "boolean") this.#setFlag("OF", flags.OF);
    yield {
      type: "cpu:alu.execute",
      operation,
      size: result.size,
      result: this.#registers.result,
      flags: this.#registers.FLAGS,
    };
  }

  // #=========================================================================#
  // # Bus methods                                                             #
  // #=========================================================================#

  /**
   * Sets the value of the MAR.
   *
   * ---
   * Called by the instructions ({@link InstructionType.execute}) and the CPU.
   */
  *setMAR(register: MARRegister): EventGenerator {
    const value = this.getRegister(register);
    this.#MAR = value;
    yield { type: "cpu:mar.set", register };
  }

  /**
   * Copies the value of the MBR to another register.
   *
   * ---
   * Called by the instructions ({@link InstructionType.execute}) and the CPU.
   */
  *getMBR(register: ByteRegister): EventGenerator {
    this.#setRegister(register, this.#MBR);
    yield { type: "cpu:mbr.get", register };
  }

  /**
   * Sets the value of the MBR.
   *
   * ---
   * Called by the instructions ({@link InstructionType.execute}) and the CPU.
   */
  *setMBR(register: ByteRegister): EventGenerator {
    const value = this.getRegister(register);
    this.#MBR = value;
    yield { type: "cpu:mbr.set", register };
  }

  /**
   * Uses the bus. Analogous to set the control lines of the bus.
   *
   * @param mode
   * - `mem-read`:  Read from memory.
   *                The address should have been previously written to the MAR register.
   *                The value will be written to the MBR register.
   * - `mem-write`: Write to memory.
   *                The address should have been previously written to the MAR register.
   *                The value will be read from the MBR register.
   * - `io-read`:   Read from I/O memory.
   *                The address should have been previously written to the low part of the MAR register.
   *                The value will be written to the MBR register.
   * - `io-write`:  Read from memory.
   *                The address should have been previously written to the low part of the MAR register.
   *                The value will be written to the MBR register.
   * - `intr-read`: Read the interrupt number from the PIC.
   *                The value will be written to the MBR register.
   *
   * @returns Whether the operation was successful.
   *
   * ---
   * Called by the instructions ({@link InstructionType.execute}) and the CPU.
   */
  *useBus(mode: `${"mem" | "io"}-${"read" | "write"}` | "intr-read"): EventGenerator<boolean> {
    switch (mode) {
      case "mem-read": {
        const value = yield* this.computer.memory.read(this.#MAR);
        if (!value) return false; // Error reading from memory
        this.#MBR = value;
        return true;
      }

      case "mem-write": {
        const success = yield* this.computer.memory.write(this.#MAR, this.#MBR);
        return success;
      }

      case "io-read": {
        const value = yield* this.computer.io.read(this.#MAR.low);
        if (!value) return false; // Error reading from i/o
        this.#MBR = value;
        return true;
      }

      case "io-write": {
        const success = yield* this.computer.io.write(this.#MAR.low, this.#MBR);
        return success;
      }

      case "intr-read": {
        const intn = yield* this.computer.io.pic.handleINTR();
        this.#MBR = intn;
        return true;
      }

      default: {
        const _exhaustiveCheck: never = mode;
        return _exhaustiveCheck;
      }
    }
  }

  // #=========================================================================#
  // # Stack methods                                                           #
  // #=========================================================================#

  /**
   * Pushes a value to the stack, and updates the SP register.
   * This value should have been previously written to the id register.
   * @see {@link https://vonsim.github.io/docs/cpu/#pila}
   * @param value The value to push to the stack.
   * @returns Whether the operation was successful.
   *
   * ---
   * Called by the instructions ({@link InstructionType.execute}).
   */
  *pushToStack(): EventGenerator<boolean> {
    let SP = this.getRegister("SP");

    if (!MemoryAddress.inRange(SP.unsigned - 1)) {
      yield { type: "cpu:error", error: new SimulatorError("stack-overflow") };
      return false;
    }
    SP = SP.add(-1);
    yield* this.updateWordRegister("SP", SP);
    yield* this.setMAR("SP");
    yield* this.setMBR("id.h");
    if (!(yield* this.useBus("mem-write"))) return false; // Error writing to memory

    if (!MemoryAddress.inRange(SP.unsigned - 1)) {
      yield { type: "cpu:error", error: new SimulatorError("stack-overflow") };
      return false;
    }
    SP = SP.add(-1);
    yield* this.updateWordRegister("SP", SP);
    yield* this.setMAR("SP");
    yield* this.setMBR("id.l");
    if (!(yield* this.useBus("mem-write"))) return false; // Error writing to memory

    return true;
  }

  /**
   * Pops a value from the stack, and updates the SP register.
   * This value will be written to the id register.
   * @see {@link https://vonsim.github.io/docs/cpu/#pila}
   * @returns Whether the operation was successful.
   *
   * ---
   * Called by the instructions ({@link InstructionType.execute}).
   */
  *popFromStack(): EventGenerator<boolean> {
    let SP = this.getRegister("SP");

    if (!MemoryAddress.inRange(SP)) {
      yield { type: "cpu:error", error: new SimulatorError("stack-underflow") };
      return false;
    }
    yield* this.setMAR("SP");
    if (!(yield* this.useBus("mem-read"))) return false; // Error reading memory
    yield* this.getMBR("id.l");
    SP = SP.add(1);
    yield* this.updateWordRegister("SP", SP);

    if (!MemoryAddress.inRange(SP)) {
      yield { type: "cpu:error", error: new SimulatorError("stack-underflow") };
      return true;
    }
    yield* this.setMAR("SP");
    if (!(yield* this.useBus("mem-read"))) return false; // Error reading memory
    yield* this.getMBR("id.h");
    SP = SP.add(1);
    yield* this.updateWordRegister("SP", SP);

    return true;
  }
}
