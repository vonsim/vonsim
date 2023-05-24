import type { InstructionStatement } from "@vonsim/assembler";
import { MemoryAddress } from "@vonsim/common/address";
import type { Byte } from "@vonsim/common/byte";

import type { Computer } from "../computer";
import { registerToBits } from "../encoding";
import { Instruction, InstructionSteps } from "../instruction";

type MOVStatement = InstructionStatement & { instruction: "MOV" };

export class MOV extends Instruction {
  readonly operation: MOVStatement["operation"];

  constructor(statement: MOVStatement) {
    super(statement.start);
    this.operation = statement.operation;
  }

  *next(computer: Computer): InstructionSteps {
    let next = this.start;

    yield {
      progress: { step: "discovery" },
      type: "cpu",
      events: [{ type: "mar.set", register: "IP" }],
    };

    let byte = computer.getMemory(next);
    yield {
      progress: { step: "discovery" },
      type: "memory.read",
      address: next,
      value: byte,
    };

    next = MemoryAddress.from(next.value + 1);
    yield {
      progress: { step: "discovery" },
      type: "cpu",
      events: [
        { type: "mbr.get", register: "IR" },
        { type: "decode" },
        { type: "register.update", register: "IP", value: byte },
      ],
    };

    byte = computer.getMemory(next);
    yield {
      progress: { step: "discovery" },
      type: "memory.read",
      address: next,
      value: byte,
    };

    next = MemoryAddress.from(next.value + 1);
    yield {
      progress: { step: "discovery" },
      type: "cpu",
      events: [
        { type: "mbr.get", register: "IR" },
        { type: "decode" },
        { type: "register.update", register: "IP", value: byte },
      ],
    };

    if (this.operation.mode === "reg<-reg") {
      const src = computer.getRegister(this.operation.src);
      computer.setRegister(this.operation.out, src);

      yield {
        progress: {
          step: "write-operands",
          name: "MOV",
          operands: [this.operation.out, this.operation.src],
        },
        type: "cpu",
        events: [{ type: "register.copy", input: this.operation.src, output: this.operation.out }],
      };
    }

    yield {
      progress: { step: "fetch-operands" },
      type: "cpu",
      events: [
        { type: "mbr.get", register: "IR" },
        { type: "decode" },
        { type: "register.update", register: "IP", value: byte },
      ],
    };
  }

  /**
   * Returns the bytes of the instruction.
   * @see /docs/especificaciones/codificacion.md
   */
  toBytes(): Uint8Array {
    const bytes: number[] = [];
    switch (this.operation.mode) {
      case "reg<-reg": {
        bytes[0] = 0b10001010;
        if (this.operation.size === 16) bytes[0] |= 1 << 0;
        bytes[1] = 0b11000000;
        bytes[1] |= registerToBits(this.operation.out) << 3;
        bytes[1] |= registerToBits(this.operation.src) << 0;
        break;
      }

      case "reg<-mem": {
        bytes[0] = 0b10001010;
        if (this.operation.size === 16) bytes[0] |= 1 << 0;
        bytes[1] = 0b00000110;
        bytes[1] |= registerToBits(this.operation.out) << 3;
        if (this.operation.src.mode === "direct") {
          bytes[2] = this.operation.src.address.lowByte.unsigned;
          bytes[3] = this.operation.src.address.highByte.unsigned;
        } else {
          bytes[1] |= 1 << 0;
        }
        break;
      }

      case "reg<-imd": {
        bytes[0] = 0b10110000;
        bytes[0] |= registerToBits(this.operation.out) << 0;
        bytes[1] = this.operation.src.lowByte.unsigned;
        if (this.operation.size === 16) {
          bytes[0] |= 1 << 3;
          bytes[2] = this.operation.src.highByte.unsigned;
        }
        break;
      }

      case "mem<-reg": {
        bytes[0] = 0b10001000;
        if (this.operation.size === 16) bytes[0] |= 1 << 0;
        bytes[1] = 0b00000110;
        bytes[1] |= registerToBits(this.operation.src) << 3;
        if (this.operation.out.mode === "direct") {
          bytes[2] = this.operation.out.address.lowByte.unsigned;
          bytes[3] = this.operation.out.address.highByte.unsigned;
        } else {
          bytes[1] |= 1 << 0;
        }
        break;
      }

      case "mem<-imd": {
        bytes[0] = 0b11000110;
        if (this.operation.out.mode === "direct") {
          bytes[1] = 0b00000110;
          bytes[2] = this.operation.out.address.lowByte.unsigned;
          bytes[3] = this.operation.out.address.highByte.unsigned;
          bytes[4] = this.operation.src.lowByte.unsigned;
          if (this.operation.size === 16) {
            bytes[0] |= 1 << 0;
            bytes[5] = this.operation.src.highByte.unsigned;
          }
        } else {
          bytes[1] = 0b00000111;
          bytes[2] = this.operation.src.lowByte.unsigned;
          if (this.operation.size === 16) {
            bytes[0] |= 1 << 0;
            bytes[3] = this.operation.src.highByte.unsigned;
          }
        }
        break;
      }

      default: {
        const _exhaustiveCheck: never = this.operation;
        return _exhaustiveCheck;
      }
    }
    return new Uint8Array(bytes);
  }
}
