import { AnyByte, Byte } from "@vonsim/common/byte";

import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";

export class ALUUnaryInstruction extends Instruction<"NOT" | "NEG" | "INC" | "DEC"> {
  get operation() {
    return this.statement.operation;
  }

  #formatOperands(): string[] {
    switch (this.operation.mode) {
      case "reg":
        return [this.operation.reg];

      case "mem-direct": {
        const addr = this.operation.address.toString();
        return [`[${addr}]`];
      }

      case "mem-indirect":
        return ["[BX]"];

      default: {
        const _exhaustiveCheck: never = this.operation;
        return _exhaustiveCheck;
      }
    }
  }

  *execute(computer: Computer): EventGenerator<boolean> {
    yield {
      type: "cpu:cycle.start",
      instruction: {
        name: this.name,
        position: this.position,
        operands: this.#formatOperands(),
        willUse: {
          ri: this.operation.mode === "mem-direct" || this.operation.mode === "mem-indirect",
          execute: true,
          writeback: true,
        },
      },
    };

    // All intructions are, at least, 2 bytes long.
    yield* super.consumeInstruction(computer, "IR");
    yield { type: "cpu:decode" };
    yield* super.consumeInstruction(computer, "IR");
    yield { type: "cpu:decode" };

    yield { type: "cpu:cycle.update", phase: "decoded" };

    let left: AnyByte;
    if (this.operation.mode === "reg") {
      // Move operand to left register
      if (this.operation.size === 8) {
        left = computer.cpu.getRegister(this.operation.reg);
        yield { type: "cpu:register.copy", input: this.operation.reg, output: "left.l" };
      } else {
        left = computer.cpu.getRegister(this.operation.reg);
        yield { type: "cpu:register.copy", input: this.operation.reg, output: "left" };
      }
    } else {
      // Fetch operand, which is the memory cell
      if (this.operation.mode === "mem-direct") {
        // Fetch memory address
        yield* this.consumeInstruction(computer, "ri.l");
        yield* this.consumeInstruction(computer, "ri.h");
      } else {
        // Move BX to ri
        yield { type: "cpu:register.copy", input: "BX", output: "ri" };
      }

      const lowAddress =
        this.operation.mode === "mem-direct"
          ? this.operation.address.byte
          : computer.cpu.getRegister("BX");
      yield { type: "cpu:mar.set", register: "ri" };
      const lowValue = yield* computer.memory.read(lowAddress);
      if (!lowValue) return false; // Error reading memory
      yield { type: "cpu:mbr.get", register: "left.l" };
      if (this.operation.size === 16) {
        const highAddress = lowAddress.add(1);
        yield { type: "cpu:register.update", register: "ri", value: highAddress };
        yield { type: "cpu:mar.set", register: "ri" };
        const highValue = yield* computer.memory.read(lowAddress);
        if (!highValue) return false; // Error reading memory
        yield { type: "cpu:mbr.get", register: "left.h" };
        left = lowValue.withHigh(highValue);
      } else {
        left = lowValue;
      }
    }

    if (this.name === "INC") {
      yield { type: "cpu:register.update", register: "right", value: Byte.fromSigned(1, 16) };
    } else if (this.name === "DEC") {
      yield { type: "cpu:register.update", register: "right", value: Byte.fromSigned(-1, 16) };
    }

    yield { type: "cpu:cycle.update", phase: "execute" };

    let result: AnyByte;

    switch (this.name) {
      case "NOT": {
        result = Byte.fromSigned(~left.signed, this.operation.size) as AnyByte;
        computer.cpu.setFlag("CF", false);
        computer.cpu.setFlag("OF", false);
        break;
      }

      case "NEG": {
        result = Byte.fromSigned(-left.signed, this.operation.size) as AnyByte;
        computer.cpu.setFlag("CF", !left.isZero());
        computer.cpu.setFlag("OF", left.signed === Byte.minSignedValue(this.operation.size));
        break;
      }

      case "INC": {
        const unsigned = left.unsigned + 1;

        if (unsigned > Byte.maxValue(this.operation.size)) {
          computer.cpu.setFlag("CF", true);
          result = Byte.fromUnsigned(
            unsigned - Byte.maxValue(this.operation.size) - 1,
            this.operation.size,
          ) as AnyByte;
        } else {
          computer.cpu.setFlag("CF", false);
          result = Byte.fromUnsigned(unsigned, this.operation.size) as AnyByte;
        }

        // When adding, the overflow flag is set if the sum of two positive numbers
        // is negative, or in this simple case, if the input was positive and the
        // output is negative (since right is always 1).
        computer.cpu.setFlag("OF", left.signed >= 0 && result.signed < 0);
        break;
      }

      case "DEC": {
        const unsigned = left.unsigned - 1;

        if (unsigned < 0) {
          computer.cpu.setFlag("CF", true);
          result = Byte.fromUnsigned(
            unsigned + Byte.maxValue(this.operation.size) + 1,
            this.operation.size,
          ) as AnyByte;
        } else {
          computer.cpu.setFlag("CF", false);
          result = Byte.fromUnsigned(unsigned, this.operation.size) as AnyByte;
        }

        // When subtracting, the overflow flag is set if a negative number minus a
        // positive number is positive, or in this simple case, if the input was
        // negative and the output is positive (since right is always 1).
        computer.cpu.setFlag("OF", left.signed < 0 && result.signed >= 0);
        break;
      }
    }

    computer.cpu.setFlag("ZF", result.unsigned === 0);
    computer.cpu.setFlag("SF", result.signed < 0);

    // This if is kind of unnecessary, but TypeScript likes it
    if (this.operation.size === 8) {
      yield {
        type: "cpu:alu.execute",
        operation: this.name === "INC" ? "ADD" : this.name === "DEC" ? "SUB" : this.name,
        size: this.operation.size,
        result: result as Byte<8>,
        flags: computer.cpu.FLAGS,
      };
    } else {
      yield {
        type: "cpu:alu.execute",
        operation: this.name === "INC" ? "ADD" : this.name === "DEC" ? "SUB" : this.name,
        size: this.operation.size,
        result: result as Byte<16>,
        flags: computer.cpu.FLAGS,
      };
    }

    yield { type: "cpu:cycle.update", phase: "writeback" };

    if (this.operation.mode === "reg") {
      // Move result to operand
      if (this.operation.size === 8) {
        const reg = this.operation.reg;
        computer.cpu.setRegister(reg, result as Byte<8>);
        yield { type: "cpu:register.copy", input: "result.l", output: reg };
      } else {
        const reg = this.operation.reg;
        computer.cpu.setRegister(reg, result as Byte<16>);
        yield { type: "cpu:register.copy", input: "result", output: reg };
      }
    } else {
      const lowAddress =
        this.operation.mode === "mem-direct"
          ? this.operation.address.byte
          : computer.cpu.getRegister("BX");
      if (this.operation.size === 16) {
        yield { type: "cpu:register.update", register: "ri", value: lowAddress };
      }
      yield { type: "cpu:mar.set", register: "ri" };
      yield { type: "cpu:mbr.set", register: "result.l" };
      if (!(yield* computer.memory.write(lowAddress, result.low))) return false; // Error writing memory
      if (this.operation.size === 16) {
        const highAddress = lowAddress.add(1);
        yield { type: "cpu:register.update", register: "ri", value: highAddress };
        yield { type: "cpu:mar.set", register: "ri" };
        yield { type: "cpu:mbr.set", register: "result.h" };
        if (!(yield* computer.memory.write(lowAddress, result.high))) return false; // Error writing memory
      }
    }

    return true;
  }
}
