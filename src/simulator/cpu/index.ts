/**
 * The CPU module
 *
 * It handles most of the logic of the simulator. It has been split into several
 * submodules for convenience.
 *
 * It's also serves as a link between the Memory and the IO devices (like a real
 * computer!).
 *
 * On each tick, the CPU will execute one instruction. It will also handle the
 * interrupts.
 */

import { Err, Ok } from "rust-optionals";
import { match, P } from "ts-pattern";

import type { Program, ProgramInstruction } from "@/compiler";
import type { BinaryInstructionType } from "@/compiler/common";
import type { Interrupt, Size } from "@/config";
import { joinLowHigh, splitLowHigh } from "@/helpers";
import { Clock, Jsonable, MemoryMode, SimulatorError, SimulatorResult } from "@/simulator/common";
import type { IOInterface } from "@/simulator/io";
import type { Memory } from "@/simulator/memory";

import { ALU } from "./alu";
import { Interrupts } from "./interrupts";
import { MemoryLink } from "./memory-link";
import { Registers } from "./registers";

export type InstructionReturn = SimulatorResult<
  "continue" | "halt" | "start-debugger" | "wait-for-input"
>;

export type CPUOptions = {
  program: Program;
  mode: MemoryMode;
  speed: number;
  beforeInstruction?: (instruction: ProgramInstruction) => void;
};

export class CPU implements Jsonable {
  #alu: ALU;
  #interrupts: Interrupts;
  #registers: Registers;

  #memory: MemoryLink;
  #io: IOInterface;

  #program?: Program;
  #clock = new Clock(0);
  #beforeInstruction?: (instruction: ProgramInstruction) => void;

  constructor(memory: Memory, io: IOInterface) {
    this.#alu = new ALU();
    this.#registers = new Registers();

    this.#memory = new MemoryLink(memory, this.#registers);
    this.#io = io;

    this.#interrupts = new Interrupts({
      alu: this.#alu,
      memory: this.#memory,
      registers: this.#registers,
      io: this.#io,
    });
  }

  reset({ program, speed, mode, beforeInstruction }: CPUOptions) {
    this.#program = program;
    this.#clock = new Clock(speed);
    this.#beforeInstruction = beforeInstruction;
    this.#registers.reset({ mode });
  }

  handleInt6(char: string) {
    return this.#interrupts.handleInt6(char);
  }

  get nextTick() {
    return this.#clock.nextTick;
  }

  tick(currentTime: number): InstructionReturn {
    if (!this.#clock.tick(currentTime)) return Ok("continue");

    const checkInterrupts = this.#interrupts.checkInterrupts();
    if (checkInterrupts.isErr()) return Err(checkInterrupts.unwrapErr());

    return this.#executeInstruction();
  }

  #executeInstruction(): InstructionReturn {
    if (!this.#program) return Err(new SimulatorError("no-program"));

    const IP = this.#registers.get("IP");

    const instruction = this.#program.instructions.find(
      instruction => instruction.meta.start === IP,
    );
    if (!instruction) return Err(new SimulatorError("no-instruction", IP));

    this.#beforeInstruction?.(instruction);

    // Update the instruction register
    const IR = this.#memory.get(IP, "byte");
    if (IR.isErr()) return Err(IR.unwrapErr());
    this.#registers.set("IR", IR.unwrap());

    // Most instructions ends in a IP bump with a `return 'continue'`.
    // It also allows passing a custom IP (for example, for jumps)
    const bumpIP = (overwrite?: number): InstructionReturn => {
      this.#registers.set(
        "IP",
        typeof overwrite === "number" ? overwrite : IP + instruction.meta.length,
      );
      return Ok("continue");
    };

    return match<ProgramInstruction, InstructionReturn>(instruction)
      .with({ type: "MOV" }, ({ opSize, out, src }) => {
        const value = this.#getOperandValue(src, opSize);
        if (value.isErr()) return Err(value.unwrapErr());

        const saved = this.#saveInOperand(out, opSize, value.unwrap());
        if (saved.isErr()) return Err(saved.unwrapErr());

        return bumpIP();
      })
      .with(
        { type: P.union("ADD", "ADC", "SUB", "SBB", "AND", "OR", "XOR") },
        ({ type, opSize, out, src }) => {
          const left = this.#getOperandValue(out, opSize);
          if (left.isErr()) return Err(left.unwrapErr());

          const right = this.#getOperandValue(src, opSize);
          if (right.isErr()) return Err(right.unwrapErr());

          const result = this.#alu.execute(type, left.unwrap(), right.unwrap(), opSize);

          const saved = this.#saveInOperand(out, opSize, result);
          if (saved.isErr()) return Err(saved.unwrapErr());

          return bumpIP();
        },
      )
      .with({ type: "NOT" }, ({ type, opSize, out }) => {
        const right = this.#getOperandValue(out, opSize);
        if (right.isErr()) return Err(right.unwrapErr());

        const result = this.#alu.execute(type, 0, right.unwrap(), opSize);

        const saved = this.#saveInOperand(out, opSize, result);
        if (saved.isErr()) return Err(saved.unwrapErr());

        return bumpIP();
      })
      .with({ type: "CMP" }, ({ opSize, out, src }) => {
        const left = this.#getOperandValue(out, opSize);
        if (left.isErr()) return Err(left.unwrapErr());

        const right = this.#getOperandValue(src, opSize);
        if (right.isErr()) return Err(right.unwrapErr());

        this.#alu.execute("SUB", left.unwrap(), right.unwrap(), opSize);

        return bumpIP();
      })
      .with({ type: "INC" }, ({ opSize, out }) => {
        const value = this.#getOperandValue(out, opSize);
        if (value.isErr()) return Err(value.unwrapErr());

        const result = this.#alu.execute("ADD", value.unwrap(), 1, opSize);

        const saved = this.#saveInOperand(out, opSize, result);
        if (saved.isErr()) return Err(saved.unwrapErr());

        return bumpIP();
      })
      .with({ type: "DEC" }, ({ opSize, out }) => {
        const value = this.#getOperandValue(out, opSize);
        if (value.isErr()) return Err(value.unwrapErr());

        const result = this.#alu.execute("SUB", value.unwrap(), 1, opSize);

        const saved = this.#saveInOperand(out, opSize, result);
        if (saved.isErr()) return Err(saved.unwrapErr());

        return bumpIP();
      })
      .with({ type: "NEG" }, ({ opSize, out }) => {
        const value = this.#getOperandValue(out, opSize);
        if (value.isErr()) return Err(value.unwrapErr());

        const result = this.#alu.execute("SUB", 0, value.unwrap(), opSize);

        const saved = this.#saveInOperand(out, opSize, result);
        if (saved.isErr()) return Err(saved.unwrapErr());

        return bumpIP();
      })
      .with({ type: "PUSH" }, ({ register }) => {
        const value = this.#registers.get(register);

        const saved = this.#memory.pushToStack(value);
        if (saved.isErr()) return Err(saved.unwrapErr());

        return bumpIP();
      })
      .with({ type: "POP" }, ({ register }) => {
        const value = this.#memory.popFromStack();
        if (value.isErr()) return Err(value.unwrapErr());

        this.#registers.set(register, value.unwrap());
        return bumpIP();
      })
      .with({ type: "PUSHF" }, () => {
        const flags = this.#alu.encodeFlags();

        const saved = this.#memory.pushToStack(flags);
        if (saved.isErr()) return Err(saved.unwrapErr());

        return bumpIP();
      })
      .with({ type: "POPF" }, () => {
        const value = this.#memory.popFromStack();
        if (value.isErr()) return Err(value.unwrapErr());

        this.#alu.decodeFlags(value.unwrap());
        return bumpIP();
      })
      .with({ type: "CALL" }, ({ jumpTo, meta }) => {
        const returnAddress = IP + meta.length;

        const saved = this.#memory.pushToStack(returnAddress);
        if (saved.isErr()) return Err(saved.unwrapErr());

        return bumpIP(jumpTo);
      })
      .with({ type: "RET" }, () => {
        const returnAddress = this.#memory.popFromStack();
        if (returnAddress.isErr()) return Err(returnAddress.unwrapErr());

        return bumpIP(returnAddress.unwrap());
      })
      .with({ type: "JMP" }, ({ jumpTo }) => bumpIP(jumpTo))
      .with({ type: "JZ" }, ({ jumpTo }) => bumpIP(this.#alu.flags.zero ? jumpTo : undefined))
      .with({ type: "JNZ" }, ({ jumpTo }) => bumpIP(!this.#alu.flags.zero ? jumpTo : undefined))
      .with({ type: "JS" }, ({ jumpTo }) => bumpIP(this.#alu.flags.sign ? jumpTo : undefined))
      .with({ type: "JNS" }, ({ jumpTo }) => bumpIP(!this.#alu.flags.sign ? jumpTo : undefined))
      .with({ type: "JC" }, ({ jumpTo }) => bumpIP(this.#alu.flags.carry ? jumpTo : undefined))
      .with({ type: "JNC" }, ({ jumpTo }) => bumpIP(!this.#alu.flags.carry ? jumpTo : undefined))
      .with({ type: "JO" }, ({ jumpTo }) => bumpIP(this.#alu.flags.overflow ? jumpTo : undefined))
      .with({ type: "JNO" }, ({ jumpTo }) => bumpIP(!this.#alu.flags.overflow ? jumpTo : undefined))
      .with({ type: "IN" }, ({ opSize, port }) => {
        const address = port.type === "fixed" ? port.value : this.#registers.get("DX");

        let value: number;
        if (opSize === "byte") {
          const result = this.#io.getRegister(address);
          if (result.isErr()) return Err(result.unwrapErr());
          value = result.unwrap();
        } else {
          const low = this.#io.getRegister(address);
          if (low.isErr()) return Err(low.unwrapErr());
          const high = this.#io.getRegister(address + 1);
          if (high.isErr()) return Err(high.unwrapErr());

          value = joinLowHigh(low.unwrap(), high.unwrap());
        }

        this.#registers.set(opSize === "byte" ? "AL" : "AX", value);
        return bumpIP();
      })
      .with({ type: "OUT" }, ({ opSize, port }) => {
        const address = port.type === "fixed" ? port.value : this.#registers.get("DX");
        const value = this.#registers.get(opSize === "byte" ? "AL" : "AX");

        if (opSize === "byte") {
          const saved = this.#io.setRegister(address, value);
          if (saved.isErr()) return Err(saved.unwrapErr());
        } else {
          const [low, high] = splitLowHigh(value);

          const savedLow = this.#io.setRegister(address, low);
          if (savedLow.isErr()) return Err(savedLow.unwrapErr());
          const savedHigh = this.#io.setRegister(address, high);
          if (savedHigh.isErr()) return Err(savedHigh.unwrapErr());
        }

        return bumpIP();
      })
      .with({ type: "INT" }, ({ interrupt }) =>
        match<Interrupt, InstructionReturn>(interrupt)
          .with(0, () => Ok("halt"))
          .with(3, () => {
            bumpIP();
            return Ok("start-debugger");
          })
          .with(6, () => {
            bumpIP();
            return Ok("wait-for-input");
          })
          .with(7, () => {
            const start = this.#registers.get("BX");
            const len = this.#registers.get("AL");
            let text = "";
            for (let i = 0; i < len; i++) {
              const value = this.#memory.get(i + start, "byte");
              if (value.isErr()) return Err(value.unwrapErr());
              text += String.fromCharCode(value.unwrap());
            }
            this.#io.devices.console.write(text);
            return bumpIP();
          })
          .exhaustive(),
      )
      .with({ type: "IRET" }, () => {
        const IP = this.#memory.popFromStack();
        if (IP.isErr()) return Err(IP.unwrapErr());

        const flags = this.#memory.popFromStack();
        if (flags.isErr()) return Err(flags.unwrapErr());

        this.#alu.decodeFlags(flags.unwrap());
        return bumpIP(IP.unwrap());
      })
      .with({ type: "CLI" }, () => {
        this.#interrupts.enabled = false;
        return bumpIP();
      })
      .with({ type: "STI" }, () => {
        this.#interrupts.enabled = true;
        return bumpIP();
      })
      .with({ type: "NOP" }, () => bumpIP())
      .with({ type: "HLT" }, () => Ok("halt"))
      .exhaustive();
  }

  #getOperandValue(
    operand: Extract<ProgramInstruction, { type: BinaryInstructionType }>["src"],
    opSize: Size,
  ) {
    return match<typeof operand, SimulatorResult<number>>(operand)
      .with({ type: "register" }, ({ register }) => Ok(this.#registers.get(register)))
      .with({ type: "memory", mode: "direct" }, ({ address }) => this.#memory.get(address, opSize))
      .with({ type: "memory", mode: "indirect" }, () => {
        const address = this.#registers.get("BX");
        return this.#memory.get(address, opSize);
      })
      .with({ type: "immediate" }, ({ value }) => Ok(value))
      .exhaustive();
  }

  #saveInOperand(
    operand: Extract<ProgramInstruction, { type: BinaryInstructionType }>["out"],
    opSize: Size,
    value: number,
  ) {
    return match<typeof operand, SimulatorResult<void>>(operand)
      .with({ type: "register" }, ({ register }) => {
        this.#registers.set(register, value);
        return Ok();
      })
      .with({ type: "memory", mode: "direct" }, ({ address }) => {
        return this.#memory.set(address, opSize, value);
      })
      .with({ type: "memory", mode: "indirect" }, () => {
        const address = this.#registers.get("BX");
        return this.#memory.set(address, opSize, value);
      })
      .exhaustive();
  }

  toJSON() {
    return {
      alu: this.#alu.toJSON(),
      interrupts: this.#interrupts.toJSON(),
      registers: this.#registers.toJSON(),
    };
  }
}
