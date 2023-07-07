import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";

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
      computer.cpu.setFlag("IF", false);
      yield { type: "cpu:register.update", register: "FLAGS", value: computer.cpu.FLAGS };
    } else if (this.name === "STI") {
      yield { type: "cpu:cycle.update", phase: "execute" };
      computer.cpu.setFlag("IF", true);
      yield { type: "cpu:register.update", register: "FLAGS", value: computer.cpu.FLAGS };
    } else if (this.name === "HLT") {
      yield { type: "cpu:halt" };
      return false;
    }

    return true;
  }
}
