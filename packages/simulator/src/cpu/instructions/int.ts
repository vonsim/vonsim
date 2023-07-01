import { Byte } from "@vonsim/common/byte";

import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";

export class INTInstruction extends Instruction<"INT"> {
  get number() {
    return this.statement.value;
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

    const number = this.number.unsigned;
    switch (number) {
      case 0:
      case 3: {
        // INT 0 - Halt
        // INT 3 - Breakpoint
        yield { chip: "cpu", type: `int.${number}` };
        return true;
      }

      case 6:
      case 7: {
        // Save machine state
        yield { chip: "cpu", type: "register.copy", input: "FLAGS", output: "id" };
        if (!(yield* computer.cpu.pushToStack(computer.cpu.FLAGS))) return false; // Stack overflow
        computer.cpu.setFlag("IF", false);
        yield {
          chip: "cpu",
          type: "register.update",
          register: "FLAGS",
          value: computer.cpu.FLAGS,
        };

        yield { chip: "cpu", type: `int.${number}` };

        if (number === 6) {
          // INT 6 - Read character from console and store it in [BX]
          const address = computer.cpu.getRegister("BX");
          yield { chip: "cpu", type: "register.copy", input: "BX", output: "ri" };

          const char = yield { chip: "cpu", type: "console.read" };
          if (!(char instanceof Byte) || !char.is8bits()) {
            throw new Error("INT 6 was not given a valid 8-bit character!");
          }

          yield {
            chip: "cpu",
            type: "register.update",
            register: "id",
            value: char.withHigh(Byte.zero(8)),
          };

          yield { chip: "cpu", type: "mar.set", register: "ri" };
          yield { chip: "cpu", type: "mbr.set", register: "id.l" };
          if (!computer.memory.write(address, char)) return false; // Error writing to memory
        } else {
          // INT 7 - Write string to console, starting from [BX] and of length AL
          const start = computer.cpu.getRegister("BX").unsigned;
          yield { chip: "cpu", type: "register.copy", input: "BX", output: "ri" };

          const length = computer.cpu.getRegister("AL").unsigned;
          yield { chip: "cpu", type: "register.copy", input: "AL", output: "id.l" };

          for (let i = 0; i < length; i++) {
            yield { chip: "cpu", type: "mar.set", register: "ri" };
            const char = yield* computer.memory.read(start + i);
            if (!char) return false; // Error reading from memory
            yield { chip: "cpu", type: "console.write", char };
            yield {
              chip: "cpu",
              type: "register.update",
              register: "ri",
              value: Byte.fromUnsigned(start + i + 1, 16),
            };
            yield {
              chip: "cpu",
              type: "register.update",
              register: "id.l",
              value: Byte.fromUnsigned(length - i - 1, 8),
            };
          }
        }

        // Retrieve machine state
        const FLAGS = yield* computer.cpu.popFromStack();
        if (!FLAGS) return false; // Stack underflow
        computer.cpu.FLAGS = FLAGS;
        yield { chip: "cpu", type: "register.copy", input: "id", output: "FLAGS" };
        return true;
      }

      default: {
        yield* computer.cpu.startInterrupt(this.number);
        return true;
      }
    }
  }
}
