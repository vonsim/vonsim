import { AnyByte, Byte } from "@vonsim/common/byte";

import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";
import type { PartialFlags } from "../types";

/**
 * ALU binary instructions:
 * - {@link https://vonsim.github.io/docs/cpu/instructions/add/ | ADD}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/adc/ | ADC}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/sub/ | SUB}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/sbb/ | SBB}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/cmp/ | CMP}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/and/ | AND}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/or/ | OR}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/xor/ | XOR}
 *
 * @see {@link Instruction}
 *
 * ---
 * This class is: IMMUTABLE
 */
export class ALUBinaryInstruction extends Instruction<
  "AND" | "OR" | "XOR" | "ADD" | "ADC" | "SUB" | "SBB" | "CMP"
> {
  get operation() {
    return this.statement.operation;
  }

  #formatOperands(): string[] {
    const { mode, out, src } = this.operation;

    switch (mode) {
      case "reg<-reg":
        return [out, src];

      case "reg<-mem": {
        const addr = src.mode === "direct" ? src.address.toString() : "BX";
        return [out, `[${addr}]`];
      }

      case "reg<-imd":
        return [out, `${src.toString("hex")}h`];

      case "mem<-reg": {
        const addr = out.mode === "direct" ? out.address.toString() : "BX";
        return [`[${addr}]`, src];
      }

      case "mem<-imd": {
        const addr = out.mode === "direct" ? out.address.toString() : "BX";
        return [`[${addr}]`, `${src.toString("hex")}h`];
      }

      default: {
        const _exhaustiveCheck: never = mode;
        return _exhaustiveCheck;
      }
    }
  }

  *execute(computer: Computer): EventGenerator<boolean> {
    const { mode, size, out, src } = this.operation;

    yield {
      type: "cpu:cycle.start",
      instruction: {
        name: this.name,
        position: this.position,
        operands: this.#formatOperands(),
        willUse: {
          ri: mode === "reg<-mem" || mode === "mem<-reg" || mode === "mem<-imd",
          execute: true,
          writeback: this.name !== "CMP",
        },
      },
    };

    // All intructions are, at least, 2 bytes long.
    yield* super.consumeInstruction(computer, "IR");
    yield { type: "cpu:decode" };
    yield* super.consumeInstruction(computer, "IR");
    yield { type: "cpu:decode" };

    yield { type: "cpu:cycle.update", phase: "decoded" };

    if (mode === "reg<-reg" || mode === "reg<-mem" || mode === "reg<-imd") {
      // Move out operand to left register
      if (size === 8) yield* computer.cpu.copyByteRegister(out, "left.l");
      else yield* computer.cpu.copyWordRegister(out, "left");
    } else {
      // Fetch left operand, which is the memory cell
      if (out.mode === "direct") {
        // Fetch memory address
        yield* this.consumeInstruction(computer, "ri.l");
        yield* this.consumeInstruction(computer, "ri.h");
      } else {
        // Move BX to ri
        yield* computer.cpu.copyWordRegister("BX", "ri");
      }

      // Read value from memory
      yield* computer.cpu.setMAR("ri");
      if (!(yield* computer.cpu.useBus("mem-read"))) return false; // Error reading memory
      yield* computer.cpu.getMBR("left.l");
      if (size === 16) {
        yield* computer.cpu.updateWordRegister("ri", ri => ri.add(1));
        yield* computer.cpu.setMAR("ri");
        if (!(yield* computer.cpu.useBus("mem-read"))) return false; // Error reading memory
        yield* computer.cpu.getMBR("left.h");
      }
    }

    if (mode === "reg<-reg" || mode === "mem<-reg") {
      // Move src operand to right register
      if (size === 8) yield* computer.cpu.copyByteRegister(src, "right.l");
      else yield* computer.cpu.copyWordRegister(src, "right");
    } else if (mode === "reg<-imd" || mode === "mem<-imd") {
      // Move immediate value to right register
      yield* this.consumeInstruction(computer, "right.l");
      if (size === 16) yield* this.consumeInstruction(computer, "right.h");
    } else {
      // Fetch right operand, which is the memory cell
      if (src.mode === "direct") {
        // Fetch memory address
        yield* this.consumeInstruction(computer, "ri.l");
        yield* this.consumeInstruction(computer, "ri.h");
      } else {
        // Move BX to ri
        yield* computer.cpu.copyWordRegister("BX", "ri");
      }

      // Read value from memory
      yield* computer.cpu.setMAR("ri");
      if (!(yield* computer.cpu.useBus("mem-read"))) return false; // Error reading memory
      yield* computer.cpu.getMBR("right.l");
      if (size === 16) {
        yield* computer.cpu.updateWordRegister("ri", ri => ri.add(1));
        yield* computer.cpu.setMAR("ri");
        if (!(yield* computer.cpu.useBus("mem-read"))) return false; // Error reading memory
        yield* computer.cpu.getMBR("right.h");
      }
    }

    yield { type: "cpu:cycle.update", phase: "execute" };

    const left = size === 8 ? computer.cpu.getRegister("left.l") : computer.cpu.getRegister("left");
    const right =
      size === 8 ? computer.cpu.getRegister("right.l") : computer.cpu.getRegister("right");
    let result: AnyByte;
    const flags: PartialFlags = {};

    switch (this.name) {
      case "AND":
      case "OR":
      case "XOR": {
        // When performing bitwise operations, we use signed numbers
        // because we want to preserve the sign bit in JavaScript.
        const signed =
          this.name === "AND"
            ? left.signed & right.signed
            : this.name === "OR"
            ? left.signed | right.signed
            : left.signed ^ right.signed;

        result = Byte.fromSigned(signed, size) as AnyByte;
        flags.CF = false;
        flags.OF = false;
        break;
      }

      case "ADD":
      case "ADC": {
        const carry = this.name === "ADC" && computer.cpu.getFlag("CF") ? 1 : 0;
        const unsigned = left.unsigned + right.unsigned + carry;

        if (unsigned > Byte.maxValue(size)) {
          flags.CF = true;
          result = Byte.fromUnsigned(unsigned - Byte.maxValue(size) - 1, size) as AnyByte;
        } else {
          flags.CF = false;
          result = Byte.fromUnsigned(unsigned, size) as AnyByte;
        }

        // When adding, the overflow flag is set if
        // - the sum of two positive numbers is negative, or
        // - the sum of two negative numbers is positive.
        flags.OF =
          (left.signed >= 0 && right.signed >= 0 && result.signed < 0) ||
          (left.signed < 0 && right.signed < 0 && result.signed >= 0);
        break;
      }

      case "SUB":
      case "SBB":
      case "CMP": {
        const borrow = this.name === "SBB" && computer.cpu.getFlag("CF") ? 1 : 0;
        const unsigned = left.unsigned - right.unsigned - borrow;

        if (unsigned < 0) {
          flags.CF = true;
          result = Byte.fromUnsigned(unsigned + Byte.maxValue(size) + 1, size) as AnyByte;
        } else {
          flags.CF = false;
          result = Byte.fromUnsigned(unsigned, size) as AnyByte;
        }

        // When subtracting, the overflow flag is set if
        // - a positive number minus a negative number is negative, or
        // - a negative number minus a positive number is positive.
        flags.OF =
          (left.signed >= 0 && right.signed < 0 && result.signed < 0) ||
          (left.signed < 0 && right.signed >= 0 && result.signed >= 0);
        break;
      }
    }

    flags.ZF = result.isZero();
    flags.SF = result.signed < 0;

    yield* computer.cpu.aluExecute(this.name === "CMP" ? "SUB" : this.name, result, flags);

    if (this.name === "CMP") return true; // No writeback

    yield { type: "cpu:cycle.update", phase: "writeback" };

    if (mode === "reg<-reg" || mode === "reg<-mem" || mode === "reg<-imd") {
      // Move result to out operand
      if (size === 8) yield* computer.cpu.copyByteRegister("result.l", out);
      else yield* computer.cpu.copyWordRegister("result", out);
    } else {
      // If size is 16, we first write the high byte, for convienience
      if (size === 16) {
        yield* computer.cpu.setMAR("ri");
        yield* computer.cpu.setMBR("result.h");
        if (!(yield* computer.cpu.useBus("mem-write"))) return false; // Error writing memory
        yield* computer.cpu.updateWordRegister("ri", ri => ri.add(-1));
      }

      // Write low byte
      yield* computer.cpu.setMAR("ri");
      yield* computer.cpu.setMBR("result.l");
      if (!(yield* computer.cpu.useBus("mem-write"))) return false; // Error writing memory
    }

    return true;
  }
}
