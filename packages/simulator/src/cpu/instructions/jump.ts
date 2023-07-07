import type { Computer } from "../../computer";
import type { EventGenerator } from "../../events";
import { Instruction } from "../instruction";

export class JumpInstruction extends Instruction<
  "JC" | "JNC" | "JZ" | "JNZ" | "JS" | "JNS" | "JO" | "JNO" | "JMP" | "CALL"
> {
  get jumpTo() {
    return this.statement.address;
  }

  *execute(computer: Computer): EventGenerator<boolean> {
    yield {
      type: "cpu:cycle.start",
      instruction: {
        name: this.name,
        position: this.position,
        operands: [this.jumpTo.toString()],
        willUse: { id: this.name === "CALL", ri: true, writeback: true },
      },
    };

    // All these intructions are 3 bytes long.
    yield* super.consumeInstruction(computer, "IR");
    yield { type: "cpu:decode" };
    yield { type: "cpu:cycle.update", phase: "decoded" };

    let jump: boolean;
    switch (this.name) {
      case "JC":
        jump = computer.cpu.getFlag("CF");
        break;
      case "JNC":
        jump = !computer.cpu.getFlag("CF");
        break;
      case "JZ":
        jump = computer.cpu.getFlag("ZF");
        break;
      case "JNZ":
        jump = !computer.cpu.getFlag("ZF");
        break;
      case "JS":
        jump = computer.cpu.getFlag("SF");
        break;
      case "JNS":
        jump = !computer.cpu.getFlag("SF");
        break;
      case "JO":
        jump = computer.cpu.getFlag("OF");
        break;
      case "JNO":
        jump = !computer.cpu.getFlag("OF");
        break;
      case "CALL":
      case "JMP":
        jump = true;
        break;
      default: {
        const _exhaustiveCheck: never = this.name;
        return _exhaustiveCheck;
      }
    }

    if (!jump) {
      yield { type: "cpu:cycle.update", phase: "writeback" };
      const IP = computer.cpu.getIP().byte.add(2);
      computer.cpu.setIP(IP);
      yield { type: "cpu:register.update", register: "IP", value: IP };
      return true;
    }

    // Consume jump address
    yield* super.consumeInstruction(computer, "ri.l");
    yield* super.consumeInstruction(computer, "ri.h");
    yield { type: "cpu:cycle.update", phase: "writeback" };

    if (this.name === "CALL") {
      const IP = computer.cpu.getIP().byte;
      yield { type: "cpu:register.copy", input: "IP", output: "id" };
      yield* computer.cpu.pushToStack(IP);
    }

    computer.cpu.setIP(this.jumpTo);
    yield { type: "cpu:register.update", register: "IP", value: this.jumpTo.byte };

    return true;
  }
}
