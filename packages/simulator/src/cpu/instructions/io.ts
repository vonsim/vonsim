import { Byte } from "@vonsim/common/byte";

import type { Computer } from "../../computer";
import { SimulatorError } from "../../error";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";

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
      component: "cpu",
      type: "cycle.start",
      instruction: {
        name: this.name,
        operands: this.#formatOperands(),
        willUse: { ri: true, writeback: true },
      },
    };

    yield* super.consumeInstruction(computer, "IR");
    yield { component: "cpu", type: "decode" };
    yield { component: "cpu", type: "cycle.update", phase: "decoded" };

    if (this.operation.port === "fixed") {
      yield { component: "cpu", type: "register.update", register: "ri", value: Byte.zero(16) };
      yield* super.consumeInstruction(computer, "ri.l");
    } else {
      yield { component: "cpu", type: "register.copy", input: "DX", output: "ri" };
      if (!computer.cpu.getRegister("DX").high.isZero()) {
        yield {
          component: "cpu",
          type: "error",
          error: new SimulatorError("io-memory-not-implemented", computer.cpu.getRegister("DX")),
        };
        return false;
      }
    }

    yield { component: "cpu", type: "cycle.update", phase: "writeback" };

    let port =
      this.operation.port === "variable"
        ? computer.cpu.getRegister("DX").low
        : this.operation.address.byte;

    if (this.name === "IN") {
      yield { component: "cpu", type: "mar.set", register: "ri" };
      const low = yield* computer.io.read(port);
      if (!low) return false; // Error reading IO
      computer.cpu.setRegister("AL", low);
      yield { component: "cpu", type: "mbr.get", register: "AL" };
      if (this.operation.size === 16) {
        port = port.add(1);
        yield { component: "cpu", type: "register.update", register: "ri.l", value: port };
        yield { component: "cpu", type: "mar.set", register: "ri" };
        const high = yield* computer.io.read(port);
        if (!high) return false; // Error reading IO
        computer.cpu.setRegister("AH", high);
        yield { component: "cpu", type: "mbr.get", register: "AH" };
      }
    } else {
      yield { component: "cpu", type: "mar.set", register: "ri" };
      yield { component: "cpu", type: "mbr.set", register: "AL" };
      if (!(yield* computer.io.write(port, computer.cpu.getRegister("AL")))) return false; // Error reading IO
      if (this.operation.size === 16) {
        port = port.add(1);
        yield { component: "cpu", type: "register.update", register: "ri.l", value: port };
        yield { component: "cpu", type: "mar.set", register: "ri" };
        yield { component: "cpu", type: "mbr.set", register: "AH" };
        if (!(yield* computer.io.write(port, computer.cpu.getRegister("AH")))) return false; // Error reading IO
      }
    }

    return true;
  }
}
