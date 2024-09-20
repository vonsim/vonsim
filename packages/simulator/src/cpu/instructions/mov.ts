import { Byte } from "@vonsim/common/byte";

import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";
import { splitRegister } from "../utils";

/**
 * {@link https://vonsim.github.io/en/computer/instructions/mov | MOV} instruction.
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

    const formatMemoryAccess = (
      access: Exclude<typeof this.operation, { out: string }>["out"],
    ): string => {
      if (access.mode === "direct") return access.address.toString();

      let out = "BX";
      if (access.offset) {
        if (access.offset.signed > 0) {
          out += `+${access.offset.toString("hex")}h`;
        } else {
          const positive = Byte.fromUnsigned(-access.offset.signed, access.offset.size);
          out += `-${positive.toString("hex")}h`;
        }
      }
      return out;
    };

    switch (mode) {
      case "reg<-reg":
        return [out, src];
      case "reg<-mem":
        return [out, `[${formatMemoryAccess(src)}]`];
      case "reg<-imd":
        return [out, `${src.toString("hex")}h`];
      case "mem<-reg":
        return [`[${formatMemoryAccess(out)}]`, src];
      case "mem<-imd":
        return [`[${formatMemoryAccess(out)}]`, `${src.toString("hex")}h`];

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
          id:
            mode === "reg<-mem" ||
            mode === "reg<-imd" ||
            mode === "mem<-imd" ||
            (mode === "mem<-reg" && out.mode === "indirect" && out.offset !== null),
        },
      },
    };

    // All intructions are, at least, 2 bytes long.
    yield* super.consumeInstruction(computer, "IR");
    yield { type: "cpu:decode" };
    yield* super.consumeInstruction(computer, "IR");
    yield { type: "cpu:decode" };

    yield { type: "cpu:cycle.update", phase: "decoded", next: "fetch-operands" };

    if (
      this.operation.mode === "reg<-mem" ||
      this.operation.mode === "mem<-reg" ||
      this.operation.mode === "mem<-imd"
    ) {
      const mem = this.operation.mode === "reg<-mem" ? this.operation.src : this.operation.out;
      if (mem.mode === "direct") {
        // Fetch memory address
        yield* super.consumeInstruction(computer, "ri.l");
        yield* super.consumeInstruction(computer, "ri.h");
      } else {
        // Move BX to ri
        yield* computer.cpu.copyWordRegister("BX", "ri");
        if (mem.offset) {
          // Fetch offset
          yield* this.consumeInstruction(computer, "id.l");
          yield* this.consumeInstruction(computer, "id.h");
          // Add offset to BX
          yield* computer.cpu.updateWordRegister("ri", ri => ri.add(mem.offset!.signed));
        }
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
        const [low, high] = splitRegister(src);
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
