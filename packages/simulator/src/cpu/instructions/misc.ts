import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";

/**
 * Other instructions:
 * - {@link https://vonsim.github.io/docs/cpu/instructions/cli/ | CLI}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/sti/ | STI}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/nop/ | NOP}
 * - {@link https://vonsim.github.io/docs/cpu/instructions/hlt/ | HLT}
 *
 * @see {@link Instruction}
 */
export class MiscInstruction extends Instruction<"CLI" | "STI" | "NOP" | "HLT"> {
  *execute(computer: Computer): EventGenerator<boolean> {
    yield {
      type: "cpu:cycle.start",
      instruction: {
        name: this.name,
        position: this.position,
        operands: [],
        willUse: { execute: this.name === "CLI" || this.name === "STI" },
      },
    };

    yield* super.consumeInstruction(computer, "IR");
    yield { type: "cpu:decode" };
    yield { type: "cpu:cycle.update", phase: "decoded" };

    if (this.name === "CLI") {
      yield { type: "cpu:cycle.update", phase: "execute" };
      yield* computer.cpu.updateFLAGS({ IF: false });
    } else if (this.name === "STI") {
      yield { type: "cpu:cycle.update", phase: "execute" };
      yield* computer.cpu.updateFLAGS({ IF: true });
    } else if (this.name === "HLT") {
      yield { type: "cpu:halt" };
      return false;
    }

    return true;
  }
}
