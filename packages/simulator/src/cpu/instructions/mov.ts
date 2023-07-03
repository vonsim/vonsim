import type { WordRegister } from "@vonsim/assembler";

import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";
import type { Physical8bitsRegisters } from "../micro-ops";

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

  *execute(computer: Computer): EventGenerator<boolean> {
    const { mode, size, out, src } = this.operation;

    yield {
      type: "cpu:cycle.start",
      instruction: {
        name: this.name,
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
        yield { type: "cpu:register.copy", input: "BX", output: "ri" };
      }
    }
    if (this.operation.mode === "reg<-imd" || this.operation.mode === "mem<-imd") {
      // Fetch immediate value
      yield* super.consumeInstruction(computer, "id.l");
      if (this.operation.size === 16) yield* super.consumeInstruction(computer, "id.h");
    }

    yield { type: "cpu:cycle.update", phase: "writeback" };

    switch (mode) {
      case "reg<-reg": {
        // Yes, this is silly, but it ensures type safety.
        if (size === 8) {
          yield { type: "cpu:register.copy", input: src, output: out };
        } else {
          yield { type: "cpu:register.copy", input: src, output: out };
        }
        return true;
      }

      case "reg<-mem": {
        yield { type: "cpu:mar.set", register: "ri" };
        const lowAddress =
          src.mode === "direct" ? src.address.byte : computer.cpu.getRegister("BX");
        const lowValue = yield* computer.memory.read(lowAddress);
        if (!lowValue) return false; // Error reading memory
        yield { type: "cpu:mbr.get", register: "id.l" };
        if (size === 8) {
          computer.cpu.setRegister(out, lowValue);
          yield { type: "cpu:register.copy", input: "id.l", output: out };
          return true;
        } else {
          const highAddress = lowAddress.add(1);
          yield { type: "cpu:register.update", register: "ri", value: highAddress };
          yield { type: "cpu:mar.set", register: "ri" };
          const highValue = yield* computer.memory.read(highAddress);
          if (!highValue) return false; // Error reading memory
          yield { type: "cpu:mbr.get", register: "id.h" };
          const value = lowValue.withHigh(highValue);
          computer.cpu.setRegister(out, value);
          yield { type: "cpu:register.copy", input: "id", output: out };
          return true;
        }
      }

      case "reg<-imd": {
        if (size === 8) {
          yield { type: "cpu:register.copy", input: "id.l", output: out };
        } else {
          yield { type: "cpu:register.copy", input: "id", output: out };
        }
        return true;
      }

      case "mem<-reg": {
        if (size === 8) {
          yield { type: "cpu:mar.set", register: "ri" };
          yield { type: "cpu:mbr.set", register: src };
          const address = out.mode === "direct" ? out.address : computer.cpu.getRegister("BX");
          const value = computer.cpu.getRegister(src);
          if (!(yield* computer.memory.write(address, value))) return false; // Error writing memory
        } else {
          const [low, high] = this.#splitRegister(src);
          const value = computer.cpu.getRegister(src);
          yield { type: "cpu:mar.set", register: "ri" };
          yield { type: "cpu:mbr.set", register: low };
          const lowAddress =
            out.mode === "direct" ? out.address.byte : computer.cpu.getRegister("BX");
          if (!(yield* computer.memory.write(lowAddress, value.low))) return false; // Error writing memory
          const highAddress = lowAddress.add(1);
          yield { type: "cpu:register.update", register: "ri", value: highAddress };
          yield { type: "cpu:mar.set", register: "ri" };
          yield { type: "cpu:mbr.set", register: high };
          if (!(yield* computer.memory.write(lowAddress, value.high))) return false; // Error writing memory
        }
        return true;
      }

      case "mem<-imd": {
        const lowAddress =
          out.mode === "direct" ? out.address.byte : computer.cpu.getRegister("BX");
        yield { type: "cpu:mar.set", register: "ri" };
        yield { type: "cpu:mbr.set", register: "id.l" };
        if (!(yield* computer.memory.write(lowAddress, src.low))) return false; // Error writing memory
        if (size === 8) return true;
        const highAddress = lowAddress.add(1);
        yield { type: "cpu:register.update", register: "ri", value: highAddress };
        yield { type: "cpu:mar.set", register: "ri" };
        yield { type: "cpu:mbr.set", register: "id.h" };
        if (!(yield* computer.memory.write(highAddress, src.high))) return false; // Error writing memory
        return true;
      }

      default: {
        const _exhaustiveCheck: never = mode;
        return _exhaustiveCheck;
      }
    }
  }

  /**
   * Split a 16-bit register into two 8-bit registers.
   * @param register The register to split.
   * @returns A tuple with the low and high parts of the register.
   */
  #splitRegister(
    register: WordRegister,
  ): [low: Physical8bitsRegisters, high: Physical8bitsRegisters] {
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

      default: {
        const _exhaustiveCheck: never = register;
        return _exhaustiveCheck;
      }
    }
  }
}
