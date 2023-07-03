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
      type: "cpu:cycle.start",
      instruction: {
        name: this.name,
        operands: [this.number.toString("uint")],
        willUse: { id: true, execute: true },
      },
    };

    yield* super.consumeInstruction(computer, "IR");
    yield { type: "cpu:decode" };
    yield { type: "cpu:cycle.update", phase: "decoded" };

    // Consume interrupt number
    yield* super.consumeInstruction(computer, "ri.l");

    yield { type: "cpu:cycle.update", phase: "execute" };

    const number = this.number.unsigned;
    switch (number) {
      case 0: {
        // INT 0 - Halt
        yield { type: "cpu:int.0" };
        return false; // Halt
      }

      case 3: {
        // INT 3 - Breakpoint
        yield { type: "cpu:int.3" };
        return true;
      }

      case 6:
      case 7: {
        // Save machine state
        yield { type: "cpu:register.copy", input: "FLAGS", output: "id" };
        if (!(yield* computer.cpu.pushToStack(computer.cpu.FLAGS))) return false; // Stack overflow
        computer.cpu.setFlag("IF", false);
        yield { type: "cpu:register.update", register: "FLAGS", value: computer.cpu.FLAGS };

        yield { type: `cpu:int.${number}` };

        if (number === 6) {
          // INT 6 - Read character from console and store it in [BX]
          const address = computer.cpu.getRegister("BX");
          yield { type: "cpu:register.copy", input: "BX", output: "ri" };

          const char = yield* computer.devices.console.read();

          yield { type: "cpu:register.update", register: "id", value: char.withHigh(Byte.zero(8)) };

          yield { type: "cpu:mar.set", register: "ri" };
          yield { type: "cpu:mbr.set", register: "id.l" };
          if (!computer.memory.write(address, char)) return false; // Error writing to memory
        } else {
          // INT 7 - Write string to console, starting from [BX] and of length AL
          const start = computer.cpu.getRegister("BX");
          yield { type: "cpu:register.copy", input: "BX", output: "ri" };

          const length = computer.cpu.getRegister("AL").unsigned;
          yield { type: "cpu:register.copy", input: "AL", output: "id.l" };

          for (let i = 0; i < length; i++) {
            yield { type: "cpu:mar.set", register: "ri" };
            const char = yield* computer.memory.read(start.add(i));
            if (!char) return false; // Error reading from memory
            yield* computer.devices.console.write(char);
            yield { type: "cpu:register.update", register: "ri", value: start.add(i + 1) };
            yield {
              type: "cpu:register.update",
              register: "id.l",
              value: Byte.fromUnsigned(length - i - 1, 8),
            };
          }
        }

        // Retrieve machine state
        const FLAGS = yield* computer.cpu.popFromStack();
        if (!FLAGS) return false; // Stack underflow
        computer.cpu.FLAGS = FLAGS;
        yield { type: "cpu:register.copy", input: "id", output: "FLAGS" };
        return true;
      }

      default: {
        yield* computer.cpu.startInterrupt(this.number);
        return true;
      }
    }
  }
}
