import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";

export class ReturnInstruction extends Instruction<"RET" | "IRET"> {
  *execute(computer: Computer): EventGenerator<boolean> {
    yield {
      type: "cpu:cycle.start",
      instruction: {
        name: this.name,
        operands: [],
        willUse: { id: true, writeback: true },
      },
    };

    // All these intructions are one byte long.
    yield* super.consumeInstruction(computer, "IR");
    yield { type: "cpu:decode" };
    yield { type: "cpu:cycle.update", phase: "decoded" };

    const IP = yield* computer.cpu.popFromStack();
    if (!IP) return false; // Stack underflow
    yield { type: "cpu:cycle.update", phase: "writeback" };
    computer.cpu.setIP(IP);
    yield { type: "cpu:register.copy", input: "id", output: "IP" };

    if (this.name === "IRET") {
      const FLAGS = yield* computer.cpu.popFromStack();
      if (!FLAGS) return false; // Stack underflow
      computer.cpu.FLAGS = FLAGS;
      yield { type: "cpu:register.copy", input: "id", output: "FLAGS" };
      // NOTE: IRET doesn't need to explicitly set IF to true, since it's already set to true by default.
      // So, by returning FLAGS to the original value, IF will be set to true.
    }

    return true;
  }
}
