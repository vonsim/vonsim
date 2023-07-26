import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";

/**
 * Stack instructions:
 * - {@link https://vonsim.github.io/docs/cpu/instructions/push/ | PUSH}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/pop/ | POP}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/pushf/ | PUSHF}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/popf/ | POPF}
 *
 * @see {@link Instruction}
 *
 * ---
 * This class is: IMMUTABLE
 */
export class StackInstruction extends Instruction<"PUSH" | "POP" | "PUSHF" | "POPF"> {
  *execute(computer: Computer): EventGenerator<boolean> {
    const register =
      this.statement.instruction === "PUSH" || this.statement.instruction === "POP"
        ? this.statement.register
        : "FLAGS";

    yield {
      type: "cpu:cycle.start",
      instruction: {
        name: this.name,
        position: this.position,
        operands: register !== "FLAGS" ? [register] : [],
        willUse: { id: true, writeback: true },
      },
    };

    // All these intructions are one byte long.
    yield* super.consumeInstruction(computer, "IR");
    yield { type: "cpu:decode" };
    yield { type: "cpu:cycle.update", phase: "decoded" };

    if (this.name === "PUSH" || this.name === "PUSHF") {
      yield* computer.cpu.copyWordRegister(register, "id");
      yield { type: "cpu:cycle.update", phase: "writeback" };
      return yield* computer.cpu.pushToStack(); // Will return false if stack overflow
    } else {
      if (!(yield* computer.cpu.popFromStack())) return false; // Stack underflow

      yield { type: "cpu:cycle.update", phase: "writeback" };

      yield* computer.cpu.copyWordRegister("id", register);
      return true;
    }
  }
}
