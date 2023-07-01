import { Byte } from "@vonsim/common/byte";

import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";

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
      chip: "cpu",
      type: "cycle.start",
      instruction: {
        name: this.name,
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
    yield { chip: "cpu", type: "decode" };
    yield* super.consumeInstruction(computer, "IR");
    yield { chip: "cpu", type: "decode" };

    yield { chip: "cpu", type: "cycle.update", phase: "decoded" };

    let left: Byte<typeof size>;
    if (mode === "reg<-reg" || mode === "reg<-mem" || mode === "reg<-imd") {
      // Move out operand to left register
      left = computer.cpu.getRegister(out);
      if (size === 8) yield { chip: "cpu", type: "register.copy", input: out, output: "left.l" };
      else yield { chip: "cpu", type: "register.copy", input: out, output: "left" };
    } else {
      // Fetch left operand, which is the memory cell
      if (out.mode === "direct") {
        // Fetch memory address
        yield* this.consumeInstruction(computer, "ri.l");
        yield* this.consumeInstruction(computer, "ri.h");
      } else {
        // Move BX to ri
        yield { chip: "cpu", type: "register.copy", input: "BX", output: "ri" };
      }

      const lowAddress = out.mode === "direct" ? out.address.byte : computer.cpu.getRegister("BX");
      yield { chip: "cpu", type: "mar.set", register: "ri" };
      const lowValue = yield* computer.memory.read(lowAddress);
      if (!lowValue) return false; // Error reading memory
      yield { chip: "cpu", type: "mbr.get", register: "left.l" };
      if (size === 16) {
        const highAddress = Byte.fromUnsigned(lowAddress.unsigned + 1, 16);
        yield { chip: "cpu", type: "register.update", register: "ri", value: highAddress };
        yield { chip: "cpu", type: "mar.set", register: "ri" };
        const highValue = yield* computer.memory.read(lowAddress);
        if (!highValue) return false; // Error reading memory
        yield { chip: "cpu", type: "mbr.get", register: "left.h" };
        left = lowValue.withHigh(highValue);
      } else {
        left = lowValue;
      }
    }

    let right: Byte<typeof size>;
    if (mode === "reg<-reg" || mode === "mem<-reg") {
      // Move src operand to right register
      right = computer.cpu.getRegister(src);
      if (size === 8) yield { chip: "cpu", type: "register.copy", input: src, output: "right.l" };
      else yield { chip: "cpu", type: "register.copy", input: src, output: "right" };
    } else if (mode === "reg<-imd" || mode === "mem<-imd") {
      // Move immediate value to right register
      yield* this.consumeInstruction(computer, "right.l");
      yield* this.consumeInstruction(computer, "right.h");
      right = src;
    } else {
      // Fetch right operand, which is the memory cell
      if (src.mode === "direct") {
        // Fetch memory address
        yield* this.consumeInstruction(computer, "ri.l");
        yield* this.consumeInstruction(computer, "ri.h");
      } else {
        // Move BX to ri
        yield { chip: "cpu", type: "register.copy", input: "BX", output: "ri" };
      }

      const lowAddress = src.mode === "direct" ? src.address.byte : computer.cpu.getRegister("BX");
      yield { chip: "cpu", type: "mar.set", register: "ri" };
      const lowValue = yield* computer.memory.read(lowAddress);
      if (!lowValue) return false; // Error reading memory
      yield { chip: "cpu", type: "mbr.get", register: "right.l" };
      if (size === 16) {
        const highAddress = Byte.fromUnsigned(lowAddress.unsigned + 1, 16);
        yield { chip: "cpu", type: "register.update", register: "ri", value: highAddress };
        yield { chip: "cpu", type: "mar.set", register: "ri" };
        const highValue = yield* computer.memory.read(lowAddress);
        if (!highValue) return false; // Error reading memory
        yield { chip: "cpu", type: "mbr.get", register: "right.h" };
        right = lowValue.withHigh(highValue);
      } else {
        right = lowValue;
      }
    }

    yield { chip: "cpu", type: "cycle.update", phase: "execute" };

    let result: Byte<typeof size>;

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

        result = Byte.fromSigned(signed, size);
        computer.cpu.setFlag("CF", false);
        computer.cpu.setFlag("OF", false);
        break;
      }

      case "ADD":
      case "ADC": {
        const carry = this.name === "ADC" && computer.cpu.getFlag("CF") ? 1 : 0;
        const unsigned = left.unsigned + right.unsigned + carry;

        if (unsigned > Byte.maxValue(size)) {
          computer.cpu.setFlag("CF", true);
          result = Byte.fromUnsigned(unsigned - Byte.maxValue(size) - 1, size);
        } else {
          computer.cpu.setFlag("CF", false);
          result = Byte.fromUnsigned(unsigned, size);
        }

        // When adding, the overflow flag is set if
        // - the sum of two positive numbers is negative, or
        // - the sum of two negative numbers is positive.
        computer.cpu.setFlag(
          "OF",
          (left.signed >= 0 && right.signed >= 0 && result.signed < 0) ||
            (left.signed < 0 && right.signed < 0 && result.signed >= 0),
        );
        break;
      }

      case "SUB":
      case "SBB":
      case "CMP": {
        const borrow = this.name === "SBB" && computer.cpu.getFlag("CF") ? 1 : 0;
        const unsigned = left.unsigned - right.unsigned - borrow;

        if (unsigned < 0) {
          computer.cpu.setFlag("CF", true);
          result = Byte.fromUnsigned(unsigned + Byte.maxValue(size) + 1, size);
        } else {
          computer.cpu.setFlag("CF", false);
          result = Byte.fromUnsigned(unsigned, size);
        }

        // When subtracting, the overflow flag is set if
        // - a positive number minus a negative number is negative, or
        // - a negative number minus a positive number is positive.
        computer.cpu.setFlag(
          "OF",
          (left.signed >= 0 && right.signed < 0 && result.signed < 0) ||
            (left.signed < 0 && right.signed >= 0 && result.signed >= 0),
        );
        break;
      }
    }

    computer.cpu.setFlag("ZF", result.unsigned === 0);
    computer.cpu.setFlag("SF", result.signed < 0);

    yield {
      chip: "cpu",
      type: "alu.execute",
      operation: this.name === "CMP" ? "SUB" : this.name,
      size,
      result,
      flags: computer.cpu.FLAGS,
    };

    if (this.name === "CMP") return true; // No writeback

    yield { chip: "cpu", type: "cycle.update", phase: "writeback" };

    if (mode === "reg<-reg" || mode === "reg<-mem" || mode === "reg<-imd") {
      // Move result to out operand
      computer.cpu.setRegister(out, result);
      if (size === 8) yield { chip: "cpu", type: "register.copy", input: "result.l", output: out };
      else yield { chip: "cpu", type: "register.copy", input: "result", output: out };
    } else {
      const lowAddress = out.mode === "direct" ? out.address.byte : computer.cpu.getRegister("BX");
      if (size === 16) {
        yield { chip: "cpu", type: "register.update", register: "ri", value: lowAddress };
      }
      yield { chip: "cpu", type: "mar.set", register: "ri" };
      yield { chip: "cpu", type: "mbr.set", register: "result.l" };
      if (!(yield* computer.memory.write(lowAddress, result.low))) return false; // Error writing memory
      if (size === 16) {
        const highAddress = Byte.fromUnsigned(lowAddress.unsigned + 1, 16);
        yield { chip: "cpu", type: "register.update", register: "ri", value: highAddress };
        yield { chip: "cpu", type: "mar.set", register: "ri" };
        yield { chip: "cpu", type: "mbr.set", register: "result.h" };
        if (!(yield* computer.memory.write(lowAddress, result.high))) return false; // Error writing memory
      }
    }

    return true;
  }
}
