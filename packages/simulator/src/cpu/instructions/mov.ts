import type { Register as InputRegister } from "@vonsim/assembler";

import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";
import type { ByteRegister } from "../types";

/**
 * {@link https://vonsim.github.io/docs/cpu/instructions/mov/ | OV} instruction.
 *
 * @see {@link Instruction}
 *
 * ---
 * This class is: IMMUTABLE
 */
export class MOVInstruction extends Instruction<"MOV"> {
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

  /**
   * Given a register,
   * - if it's a word register, returns a tuple with the low and high byte registers.
   * - if it's a byte register, returns a tuple with the register and `null`.
   */
  #splitRegister(register: InputRegister): [low: ByteRegister, high: ByteRegister | null] {
    switch (register) {
      case "AX":
        return ["AL", "AH"];
      case "BX":
        return ["BL", "BH"];
      case "CX":
        return ["CL", "CH"];
      case "DX":
        return ["DL", "DH"];
      case "SP":
        return ["SP.l", "SP.h"];

      default:
        // It's a byte register
        return [register, null];
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
          id: mode === "reg<-mem" || mode === "reg<-imd" || mode === "mem<-imd",
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

    if (
      this.operation.mode === "reg<-mem" ||
      this.operation.mode === "mem<-reg" ||
      this.operation.mode === "mem<-imd"
    ) {
      const mode =
        this.operation.mode === "reg<-mem" ? this.operation.src.mode : this.operation.out.mode;
      if (mode === "direct") {
        // Fetch memory address
        yield* super.consumeInstruction(computer, "ri.l");
        yield* super.consumeInstruction(computer, "ri.h");
      } else {
        // Move BX to ri
        yield* computer.cpu.copyWordRegister("BX", "ri");
      }
    }
    if (this.operation.mode === "reg<-imd" || this.operation.mode === "mem<-imd") {
      // Fetch immediate value and store it in id
      yield* super.consumeInstruction(computer, "id.l");
      if (this.operation.size === 16) yield* super.consumeInstruction(computer, "id.h");
    }

    yield { type: "cpu:cycle.update", phase: "writeback" };

    switch (mode) {
      case "reg<-reg": {
        // Copy register
        if (size === 8) yield* computer.cpu.copyByteRegister(src, out);
        else yield* computer.cpu.copyWordRegister(src, out);

        return true;
      }

      case "reg<-mem": {
        // Fetch low byte
        yield* computer.cpu.setMAR("ri");
        if (!(yield* computer.cpu.useBus("mem-read"))) return false; // Error reading from memory
        yield* computer.cpu.getMBR("id.l");
        if (size === 16) {
          // Fetch high byte
          yield* computer.cpu.updateWordRegister("ri", ri => ri.add(1));
          yield* computer.cpu.setMAR("ri");
          if (!(yield* computer.cpu.useBus("mem-read"))) return false; // Error reading from memory
          yield* computer.cpu.getMBR("id.h");
          // Write to register
          yield* computer.cpu.copyWordRegister("id", out);
        } else {
          // Write to register
          yield* computer.cpu.copyByteRegister("id.l", out);
        }
        return true;
      }

      case "reg<-imd": {
        // Write to register
        if (size === 8) yield* computer.cpu.copyByteRegister("id.l", out);
        else yield* computer.cpu.copyWordRegister("id", out);

        return true;
      }

      case "mem<-reg": {
        const [low, high] = this.#splitRegister(src);
        // Write low byte
        yield* computer.cpu.setMAR("ri");
        yield* computer.cpu.setMBR(low);
        if (!(yield* computer.cpu.useBus("mem-write"))) return false; // Error writing to memory
        if (high) {
          // Write high byte
          yield* computer.cpu.updateWordRegister("ri", ri => ri.add(1));
          yield* computer.cpu.setMAR("ri");
          yield* computer.cpu.setMBR(high);
          if (!(yield* computer.cpu.useBus("mem-write"))) return false; // Error writing to memory
        }
        return true;
      }

      case "mem<-imd": {
        // Write low byte
        yield* computer.cpu.setMAR("ri");
        yield* computer.cpu.setMBR("id.l");
        if (!(yield* computer.cpu.useBus("mem-write"))) return false; // Error writing to memory
        if (size === 16) {
          // Write high byte
          yield* computer.cpu.updateWordRegister("ri", ri => ri.add(1));
          yield* computer.cpu.setMAR("ri");
          yield* computer.cpu.setMBR("id.h");
          if (!(yield* computer.cpu.useBus("mem-write"))) return false; // Error writing to memory
        }
        return true;
      }

      default: {
        const _exhaustiveCheck: never = mode;
        return _exhaustiveCheck;
      }
    }
  }
}
