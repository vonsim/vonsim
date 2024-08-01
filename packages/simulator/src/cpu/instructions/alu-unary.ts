import { AnyByte, Byte } from "@vonsim/common/byte";

import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";
import type { PartialFlags } from "../types";

/**
 * ALU unary instructions:
 * - {@link https://vonsim.github.io/docs/cpu/instructions/not/ | NOT}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/neg/ | NEG}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/inc/ | INC}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/dec/ | DEC}
 *
 * @see {@link Instruction}
 *
 * ---
 * This class is: IMMUTABLE
 */
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

      case "mem-indirect": {
        let addr = "BX";
        const offset = this.operation.offset;
        if (offset) {
          if (offset.signed > 0) {
            addr += `+${offset.toString("hex")}h`;
          } else {
            const positive = Byte.fromUnsigned(-offset.signed, offset.size);
            addr += `-${positive.toString("hex")}h`;
          }
        }
        return [`[${addr}]`];
      }

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
          id: this.operation.mode === "mem-indirect" && this.operation.offset !== null,
        },
      },
    };

    // All intructions are, at least, 2 bytes long.
    yield* super.consumeInstruction(computer, "IR");
    yield { type: "cpu:decode" };
    yield* super.consumeInstruction(computer, "IR");
    yield { type: "cpu:decode" };

    yield { type: "cpu:cycle.update", phase: "decoded", next: "fetch-operands" };

    if (this.operation.mode === "reg") {
      // Move operand to left register
      if (this.operation.size === 8) {
        yield* computer.cpu.copyByteRegister(this.operation.reg, "left.l");
      } else {
        yield* computer.cpu.copyWordRegister(this.operation.reg, "left");
      }
    } else {
      // Fetch operand, which is the memory cell
      if (this.operation.mode === "mem-direct") {
        // Fetch memory address
        yield* this.consumeInstruction(computer, "ri.l");
        yield* this.consumeInstruction(computer, "ri.h");
      } else {
        // Move BX to ri
        yield* computer.cpu.copyWordRegister("BX", "ri");
        if (this.operation.offset) {
          // Fetch offset
          yield* this.consumeInstruction(computer, "id.l");
          yield* this.consumeInstruction(computer, "id.h");
          // Add offset to BX
          const offset = this.operation.offset.signed;
          yield* computer.cpu.updateWordRegister("ri", ri => ri.add(offset));
        }
      }

      // Read value from memory
      yield* computer.cpu.setMAR("ri");
      if (!(yield* computer.cpu.useBus("mem-read"))) return false; // Error reading memory
      yield* computer.cpu.getMBR("left.l");
      if (this.operation.size === 16) {
        yield* computer.cpu.updateWordRegister("ri", ri => ri.add(1));
        yield* computer.cpu.setMAR("ri");
        if (!(yield* computer.cpu.useBus("mem-read"))) return false; // Error reading memory
        yield* computer.cpu.getMBR("left.h");
      }
    }

    yield { type: "cpu:cycle.update", phase: "execute" };

    const left =
      this.operation.size === 8
        ? computer.cpu.getRegister("left.l")
        : computer.cpu.getRegister("left");
    let result: AnyByte;
    const flags: PartialFlags = {};

    switch (this.name) {
      case "NOT": {
        result = Byte.fromSigned(~left.signed, this.operation.size) as AnyByte;
        flags.CF = false;
        flags.OF = false;
        break;
      }

      case "NEG": {
        result = Byte.fromSigned(-left.signed, this.operation.size) as AnyByte;
        flags.CF = !left.isZero();
        flags.OF = left.signed === Byte.minSignedValue(this.operation.size);
        break;
      }

      case "INC": {
        yield* computer.cpu.updateWordRegister("right", Byte.fromSigned(1, 16));

        const unsigned = left.unsigned + 1;

        if (unsigned > Byte.maxValue(this.operation.size)) {
          flags.CF = true;
          result = Byte.fromUnsigned(
            unsigned - Byte.maxValue(this.operation.size) - 1,
            this.operation.size,
          ) as AnyByte;
        } else {
          flags.CF = false;
          result = Byte.fromUnsigned(unsigned, this.operation.size) as AnyByte;
        }

        // When adding, the overflow flag is set if the sum of two positive numbers
        // is negative, or in this simple case, if the input was positive and the
        // output is negative (since right is always 1).
        flags.OF = left.signed >= 0 && result.signed < 0;
        break;
      }

      case "DEC": {
        yield* computer.cpu.updateWordRegister("right", Byte.fromSigned(1, 16));

        const unsigned = left.unsigned - 1;

        if (unsigned < 0) {
          flags.CF = true;
          result = Byte.fromUnsigned(
            unsigned + Byte.maxValue(this.operation.size) + 1,
            this.operation.size,
          ) as AnyByte;
        } else {
          flags.CF = false;
          result = Byte.fromUnsigned(unsigned, this.operation.size) as AnyByte;
        }

        // When subtracting, the overflow flag is set if a negative number minus a
        // positive number is positive, or in this simple case, if the input was
        // negative and the output is positive (since right is always 1).
        flags.OF = left.signed < 0 && result.signed >= 0;
        break;
      }
    }

    flags.ZF = result.isZero();
    flags.SF = result.signed < 0;

    yield* computer.cpu.aluExecute(
      this.name === "INC" ? "ADD" : this.name === "DEC" ? "SUB" : this.name,
      result,
      flags,
    );

    yield { type: "cpu:cycle.update", phase: "writeback" };

    if (this.operation.mode === "reg") {
      // Move result to operand
      if (this.operation.size === 8) {
        yield* computer.cpu.copyByteRegister("result.l", this.operation.reg);
      } else {
        yield* computer.cpu.copyWordRegister("result", this.operation.reg);
      }
    } else {
      // If size is 16, we first write the high byte, for convienience
      if (this.operation.size === 16) {
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
