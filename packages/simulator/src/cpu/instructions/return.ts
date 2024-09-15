import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";

/**
 * Return instructions:
 * - {@link https://vonsim.github.io/en/computer/instructions/ret | RET}
 * - {@link https://vonsim.github.io/en/computer/instructions/iret | IRET}
 *
 * @see {@link Instruction}
 *
 * ---
 * This class is: IMMUTABLE
 */
export class ReturnInstruction extends Instruction<"RET" | "IRET"> {
  *execute(computer: Computer): EventGenerator<boolean> {
    yield {
      type: "cpu:cycle.start",
      instruction: {
        name: this.name,
        position: this.position,
        operands: [],
        willUse: { id: true },
      },
    };

    // All these intructions are one byte long.
    yield* super.consumeInstruction(computer, "IR");
    yield { type: "cpu:decode" };
    yield { type: "cpu:cycle.update", phase: "decoded", next: "execute" };

    if (!(yield* computer.cpu.popFromStack())) return false; // Stack underflow

    yield* computer.cpu.copyWordRegister("id", "IP");

    if (this.name === "IRET") {
      if (!(yield* computer.cpu.popFromStack())) return false; // Stack underflow
      yield* computer.cpu.copyWordRegister("id", "FLAGS");
      // NOTE: IRET doesn't need to explicitly set IF to true, since it's already set to true by default.
      // So, by returning FLAGS to the original value, IF will be set to true.
    }

    return true;
  }
}
