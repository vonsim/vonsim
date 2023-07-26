import { Byte } from "@vonsim/common/byte";

import type { Computer } from "../../computer";
import { SimulatorError } from "../../error";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";

/**
 * I/O instructions:
 * - {@link https://vonsim.github.io/docs/cpu/instructions/in/ | IN}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/out/ | OUT}
 *
 * @see {@link Instruction}
 *
 * ---
 * This class is: IMMUTABLE
 */
export class IOInstruction extends Instruction<"IN" | "OUT"> {
  get operation() {
    return this.statement.operation;
  }

  #formatOperands(): string[] {
    const operands: string[] = [];

    if (this.operation.port === "variable") operands.push("DX");
    else operands.push(this.operation.address.toString());

    if (this.operation.size === 8) operands.push("AL");
    else operands.push("AX");

    if (this.name === "IN") return operands.reverse();
    else return operands;
  }

  *execute(computer: Computer): EventGenerator<boolean> {
    yield {
      type: "cpu:cycle.start",
      instruction: {
        name: this.name,
        position: this.position,
        operands: this.#formatOperands(),
        willUse: { ri: true, writeback: true },
      },
    };

    yield* super.consumeInstruction(computer, "IR");
    yield { type: "cpu:decode" };
    yield { type: "cpu:cycle.update", phase: "decoded" };

    if (this.operation.port === "fixed") {
      yield* computer.cpu.updateWordRegister("ri", Byte.zero(16));
      yield* super.consumeInstruction(computer, "ri.l");
    } else {
      yield* computer.cpu.copyWordRegister("DX", "ri");
      if (!computer.cpu.getRegister("DX").high.isZero()) {
        yield {
          type: "cpu:error",
          error: new SimulatorError("io-memory-not-implemented", computer.cpu.getRegister("DX")),
        };
        return false;
      }
    }

    yield { type: "cpu:cycle.update", phase: "writeback" };

    if (this.name === "IN") {
      yield* computer.cpu.setMAR("ri");
      if (!(yield* computer.cpu.useBus("io-read"))) return false; // Error reading from I/O
      yield* computer.cpu.getMBR("AL");
      if (this.operation.size === 16) {
        yield* computer.cpu.updateWordRegister("ri", ri => ri.add(1));
        yield* computer.cpu.setMAR("ri");
        if (!computer.cpu.getRegister("ri.h").isZero()) {
          // User tried to read from ports 255 and 256
          yield {
            type: "cpu:error",
            error: new SimulatorError("io-memory-not-implemented", computer.cpu.getRegister("ri")),
          };
          return false;
        }
        if (!(yield* computer.cpu.useBus("io-read"))) return false; // Error reading from I/O
        yield* computer.cpu.getMBR("AH");
      }
    } else {
      yield* computer.cpu.setMAR("ri");
      yield* computer.cpu.setMBR("AL");
      if (!(yield* computer.cpu.useBus("io-write"))) return false; // Error writing to I/O
      if (this.operation.size === 16) {
        yield* computer.cpu.updateWordRegister("ri", ri => ri.add(1));
        yield* computer.cpu.setMAR("ri");
        yield* computer.cpu.setMBR("AH");
        if (!computer.cpu.getRegister("ri.h").isZero()) {
          // User tried to write to ports 255 and 256
          yield {
            type: "cpu:error",
            error: new SimulatorError("io-memory-not-implemented", computer.cpu.getRegister("ri")),
          };
          return false;
        }
        if (!(yield* computer.cpu.useBus("io-write"))) return false; // Error writing to I/O
      }
    }

    return true;
  }
}
