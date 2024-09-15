import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";

/**
 * Other instructions:
 * - {@link https://vonsim.github.io/en/computer/instructions/cli | CLI}
 * - {@link https://vonsim.github.io/en/computer/instructions/sti | STI}
 * - {@link https://vonsim.github.io/en/computer/instructions/nop | NOP}
 * - {@link https://vonsim.github.io/en/computer/instructions/hlt | HLT}
 *
 * @see {@link Instruction}
 *
 * ---
 * This class is: IMMUTABLE
 */
export class MiscInstruction extends Instruction<"CLI" | "STI" | "NOP" | "HLT"> {
  *execute(computer: Computer): EventGenerator<boolean> {
    yield {
      type: "cpu:cycle.start",
      instruction: {
        name: this.name,
        position: this.position,
        operands: [],
        willUse: {},
      },
    };

    yield* super.consumeInstruction(computer, "IR");
    yield { type: "cpu:decode" };

    if (this.name === "CLI") {
      yield { type: "cpu:cycle.update", phase: "decoded", next: "execute" };
      yield* computer.cpu.updateFLAGS({ IF: false });
    } else if (this.name === "STI") {
      yield { type: "cpu:cycle.update", phase: "decoded", next: "execute" };
      yield* computer.cpu.updateFLAGS({ IF: true });
    } else if (this.name === "HLT") {
      yield { type: "cpu:cycle.update", phase: "decoded", next: "execute" };
      yield { type: "cpu:halt" };
      return false;
    }

    return true;
  }
}
