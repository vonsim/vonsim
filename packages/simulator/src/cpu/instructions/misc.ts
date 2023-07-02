import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";

export class MiscInstruction extends Instruction<"CLI" | "STI" | "NOP" | "HLT"> {
  *execute(computer: Computer): EventGenerator<boolean> {
    yield {
      component: "cpu",
      type: "cycle.start",
      instruction: {
        name: this.name,
        operands: [],
        willUse: { execute: this.name === "CLI" || this.name === "STI" },
      },
    };

    yield* super.consumeInstruction(computer, "IR");
    yield { component: "cpu", type: "decode" };
    yield { component: "cpu", type: "cycle.update", phase: "decoded" };

    if (this.name === "CLI") {
      yield { component: "cpu", type: "cycle.update", phase: "execute" };
      computer.cpu.setFlag("IF", false);
      yield {
        component: "cpu",
        type: "register.update",
        register: "FLAGS",
        value: computer.cpu.FLAGS,
      };
    } else if (this.name === "STI") {
      yield { component: "cpu", type: "cycle.update", phase: "execute" };
      computer.cpu.setFlag("IF", true);
      yield {
        component: "cpu",
        type: "register.update",
        register: "FLAGS",
        value: computer.cpu.FLAGS,
      };
    } else if (this.name === "HLT") {
      yield { component: "cpu", type: "halt" };
      return false;
    }

    return true;
  }
}
