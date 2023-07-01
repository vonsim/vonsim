import type { TupleToUnion } from "type-fest";

import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";

export type ReservedInterrupt = TupleToUnion<typeof INTInstruction.RESERVED_INTERRUPTS>;

export class INTInstruction extends Instruction<"INT"> {
  static readonly RESERVED_INTERRUPTS = [0, 3, 6, 7] as const;

  get number() {
    return this.statement.value;
  }

  isReserved() {
    return INTInstruction.RESERVED_INTERRUPTS.includes(this.number.unsigned);
  }

  *execute(computer: Computer): EventGenerator<boolean> {
    yield {
      chip: "cpu",
      type: "cycle.start",
      instruction: {
        name: this.name,
        operands: [this.number.toString("uint")],
        willUse: { id: true, execute: true },
      },
    };

    yield* super.consumeInstruction(computer, "IR");
    yield { chip: "cpu", type: "decode" };
    yield { chip: "cpu", type: "cycle.update", phase: "decoded" };

    // Consume interrupt number
    yield* super.consumeInstruction(computer, "ri.l");

    yield { chip: "cpu", type: "cycle.update", phase: "execute" };

    if (this.isReserved()) {
      yield {
        chip: "cpu",
        type: "int.reserved",
        interrupt: this.number.unsigned as ReservedInterrupt,
      };
    } else {
      yield* computer.cpu.startInterrupt(this.number);
    }

    return true;
  }
}
