import type { JsonValue } from "type-fest";

import type { ComponentReset } from "./component";
import { CPU } from "./cpu";
import { Devices } from "./devices";
import { IO } from "./io";
import { Memory } from "./memory";

export type ComputerProgram = ComponentReset;

export class Computer {
  readonly cpu: CPU;
  readonly memory: Memory;
  readonly io: IO;
  readonly devices: Devices;

  constructor() {
    const options = { computer: this } as const;
    this.cpu = new CPU(options);
    this.memory = new Memory(options);
    this.io = new IO(options);
    this.devices = new Devices(options);
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
      devices: this.devices.toJSON(),
    };
  }
}
