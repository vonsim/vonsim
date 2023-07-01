import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";

export class StackInstruction extends Instruction<"PUSH" | "POP" | "PUSHF" | "POPF"> {
  *execute(computer: Computer): EventGenerator<boolean> {
    const register =
      this.statement.instruction === "PUSH" || this.statement.instruction === "POP"
        ? this.statement.register
        : "FLAGS";

    yield {
      chip: "cpu",
      type: "cycle.start",
      instruction: {
        name: this.name,
        operands: register !== "FLAGS" ? [register] : [],
        willUse: { id: true, writeback: true },
      },
    };

    // All these intructions are one byte long.
    yield* super.consumeInstruction(computer, "IR");
    yield { chip: "cpu", type: "decode" };
    yield { chip: "cpu", type: "cycle.update", phase: "decoded" };

    if (this.name === "PUSH" || this.name === "PUSHF") {
      const value = register === "FLAGS" ? computer.cpu.FLAGS : computer.cpu.getRegister(register);
      yield { chip: "cpu", type: "register.copy", input: register, output: "id" };

      yield { chip: "cpu", type: "cycle.update", phase: "writeback" };

      return yield* computer.cpu.pushToStack(value);
    } else {
      const value = yield* computer.cpu.popFromStack();
      if (!value) return false; // Stack underflow

      yield { chip: "cpu", type: "cycle.update", phase: "writeback" };

      if (register === "FLAGS") computer.cpu.FLAGS = value;
      else computer.cpu.setRegister(register, value);

      yield { chip: "cpu", type: "register.copy", input: "id", output: register };
      return true;
    }
  }
}
