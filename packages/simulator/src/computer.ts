import type { Program } from "@vonsim/assembler";
import type { JsonValue } from "type-fest";

import { CPU } from "./cpu";
import { IOHandshake, IOPIOPrinter, IOPIOSwitchesAndLeds } from "./io/configurations";
import { Memory } from "./memory";

export type DevicesConfiguration = "pio-switches-and-leds" | "pio-printer" | "handshake";

export type ComputerOptions = {
  program: Program;
  devices: DevicesConfiguration;
} & ({ data: "clean" | "randomize" } | { data: "unchanged"; previous: Computer });

export class Computer {
  readonly cpu: CPU;
  readonly memory: Memory;
  readonly io: IOPIOSwitchesAndLeds | IOPIOPrinter | IOHandshake;

  constructor(options: ComputerOptions) {
    const init = { computer: this, ...options } as const;
    this.cpu = new CPU(init);
    this.memory = new Memory(init);
    if (options.devices === "pio-switches-and-leds") this.io = new IOPIOSwitchesAndLeds(init);
    else if (options.devices === "pio-printer") this.io = new IOPIOPrinter(init);
    else if (options.devices === "handshake") this.io = new IOHandshake(init);
    else throw new Error("Invalid devices configuration");
  }

  toJSON(): JsonValue {
    return {
      cpu: this.cpu.toJSON(),
      memory: this.memory.toJSON(),
      io: this.io.toJSON(),
    };
  }
}
