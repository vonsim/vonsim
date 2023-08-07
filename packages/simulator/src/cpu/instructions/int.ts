import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";

/**
 * {@link https://vonsim.github.io/docs/cpu/instructions/int/ | INT} instruction.
 *
 * @see {@link Instruction}
 *
 * ---
 * This class is: IMMUTABLE
 */
export class INTInstruction extends Instruction<"INT"> {
  get number() {
    return this.statement.value;
  }

  *execute(computer: Computer): EventGenerator<boolean> {
    yield {
      type: "cpu:cycle.start",
      instruction: {
        name: this.name,
        position: this.position,
        operands: [this.number.toString("uint")],
        willUse: { id: true },
      },
    };

    yield* super.consumeInstruction(computer, "IR");
    yield { type: "cpu:decode" };
    yield { type: "cpu:cycle.update", phase: "decoded", next: "fetch-operands" };

    // Consume interrupt number
    yield* super.consumeInstruction(computer, "ri.l");

    yield { type: "cpu:cycle.update", phase: "execute" };

    return yield* computer.cpu.startInterrupt(this.number);
  }
}
