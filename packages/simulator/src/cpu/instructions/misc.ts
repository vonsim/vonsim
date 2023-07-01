import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";

export class MiscInstruction extends Instruction<"CLI" | "STI" | "NOP" | "HLT"> {
  *execute(computer: Computer): EventGenerator<boolean> {
    yield {
      chip: "cpu",
      type: "cycle.start",
      instruction: {
        name: this.name,
        operands: [],
        willUse: { execute: this.name === "CLI" || this.name === "STI" },
      },
    };

    yield* super.consumeInstruction(computer, "IR");
    yield { chip: "cpu", type: "decode" };
    yield { chip: "cpu", type: "cycle.update", phase: "decoded" };

    if (this.name === "CLI") {
      yield { chip: "cpu", type: "cycle.update", phase: "execute" };
      computer.cpu.setFlag("IF", false);
      yield { chip: "cpu", type: "register.update", register: "FLAGS", value: computer.cpu.FLAGS };
    } else if (this.name === "STI") {
      yield { chip: "cpu", type: "cycle.update", phase: "execute" };
      computer.cpu.setFlag("IF", true);
      yield { chip: "cpu", type: "register.update", register: "FLAGS", value: computer.cpu.FLAGS };
    } else if (this.name === "HLT") {
      yield { chip: "cpu", type: "halt" };
      return false;
    }

    return true;
  }
}
