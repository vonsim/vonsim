import type { JsonValue } from "type-fest";

import type { ComponentReset } from "./component";
import { CPU } from "./cpu";
import { IO } from "./io";
import { Memory } from "./memory";

export type ComputerProgram = ComponentReset;

export class Computer {
  readonly cpu: CPU;
  readonly memory: Memory;
  readonly io: IO;

  constructor() {
    this.cpu = new CPU({ computer: this });
    this.memory = new Memory({ computer: this });
    this.io = new IO({ computer: this });
  }

  /**
   * Loads a program into the computer!
   */
  loadProgram(options: ComputerProgram) {
    this.cpu.reset(options);
    this.memory.reset(options);
  }

  toJSON(): JsonValue {
    return {
      cpu: this.cpu.toJSON(),
      memory: this.memory.toJSON(),
      io: this.io.toJSON(),
    };
  }
}
