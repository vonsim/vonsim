import { Byte } from "@vonsim/common/byte";

import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";

/**
 * {@link https://vonsim.github.io/docs/cpu/instructions/int/ | INT} instruction.
 *
 * @see {@link Instruction}
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
        willUse: { id: true, execute: true },
      },
    };

    yield* super.consumeInstruction(computer, "IR");
    yield { type: "cpu:decode" };
    yield { type: "cpu:cycle.update", phase: "decoded" };

    // Consume interrupt number
    yield* super.consumeInstruction(computer, "ri.l");

    yield { type: "cpu:cycle.update", phase: "execute" };

    // Check for special interrupts
    // https://vonsim.github.io/docs/cpu/#interrupciones-reservadas
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
        yield* computer.cpu.copyWordRegister("FLAGS", "id");
        if (!(yield* computer.cpu.pushToStack())) return false; // Stack overflow
        yield* computer.cpu.updateFLAGS({ IF: false });
        yield* computer.cpu.copyWordRegister("IP", "id");
        if (!(yield* computer.cpu.pushToStack())) return false; // Stack overflow

        yield { type: `cpu:int.${number}` };

        if (number === 6) {
          // INT 6 - Read character from console and store it in [BX]
          yield* computer.cpu.copyWordRegister("BX", "ri");

          const char = yield* computer.io.console.read();

          yield* computer.cpu.updateWordRegister("id", char.withHigh(Byte.zero(8)));

          yield* computer.cpu.setMAR("ri");
          yield* computer.cpu.setMBR("id.l");
          if (!(yield* computer.cpu.useBus("mem-write"))) return false; // Error writing to memory
        } else {
          // INT 7 - Write string to console, starting from [BX] and of length AL

          // Push AX and BX to stack
          yield* computer.cpu.copyWordRegister("AX", "id");
          if (!(yield* computer.cpu.pushToStack())) return false; // Stack overflow
          yield* computer.cpu.copyWordRegister("BX", "id");
          if (!(yield* computer.cpu.pushToStack())) return false; // Stack overflow

          // CMP AL, 0 -- Check if length is 0
          yield* computer.cpu.copyByteRegister("AL", "left.l");
          yield* computer.cpu.updateByteRegister("right.l", Byte.zero(8));
          const AL = computer.cpu.getRegister("AL");
          yield* computer.cpu.aluExecute("SUB", AL, {
            CF: false,
            OF: false,
            SF: AL.signed < 0,
            ZF: AL.isZero(),
          });

          while (!computer.cpu.getRegister("AL").isZero()) {
            // Read character from [BX]
            yield* computer.cpu.copyWordRegister("BX", "ri");
            yield* computer.cpu.setMAR("ri");
            if (!(yield* computer.cpu.useBus("mem-read"))) return false; // Error reading from memory
            yield* computer.cpu.getMBR("id.l");
            // Write character to console
            const char = computer.cpu.getRegister("id.l");
            yield* computer.io.console.write(char);
            // INC BX
            yield* computer.cpu.copyWordRegister("BX", "left");
            yield* computer.cpu.updateWordRegister("right", Byte.fromUnsigned(1, 16));
            const BX = computer.cpu.getRegister("BX").add(1); // Should always succeed, otherwise the memory would've thrown an error
            yield* computer.cpu.aluExecute("ADD", BX, {
              CF: false, // Never, since max value to add is 0x7FFF + 1 = 0x8000 (max memory address)
              OF: BX.signed < 0, // Only happens when 0x7FFF + 1 (max memory address)
              SF: BX.signed < 0,
              ZF: false, // Never, since max value to add is 0x7FFF + 1 = 0x8000 (max memory address)
            });
            yield* computer.cpu.copyWordRegister("result", "BX");
            // DEC AL
            yield* computer.cpu.copyByteRegister("AL", "left.l");
            yield* computer.cpu.updateByteRegister("right.l", Byte.fromUnsigned(1, 8));
            const AL = computer.cpu.getRegister("AL").add(-1); // Should always succeed, because AL != 0
            yield* computer.cpu.aluExecute("SUB", AL, {
              CF: false, // Never, will stop before doing 0 - 1
              OF: AL.signed === Byte.maxSignedValue(8), // True when 0x80 - 1
              SF: AL.signed < 0,
              ZF: AL.isZero(),
            });
            yield* computer.cpu.copyByteRegister("result.l", "AL");
          }

          // Pop BX and AX from stack
          if (!(yield* computer.cpu.popFromStack())) return false; // Stack underflow
          yield* computer.cpu.copyWordRegister("id", "BX");
          if (!(yield* computer.cpu.popFromStack())) return false; // Stack underflow
          yield* computer.cpu.copyWordRegister("id", "AX");
        }

        // Retrieve machine state
        if (!(yield* computer.cpu.popFromStack())) return false; // Stack underflow
        yield* computer.cpu.copyWordRegister("id", "IP");
        if (!(yield* computer.cpu.popFromStack())) return false; // Stack underflow
        yield* computer.cpu.copyWordRegister("id", "FLAGS");
        return true;
      }

      // It's not a special interrupt, so we
      // start the normal interrupt routine
      default: {
        yield* computer.cpu.startInterrupt(this.number);
        return true;
      }
    }
  }
}
