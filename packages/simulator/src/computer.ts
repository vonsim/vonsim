import type { Program } from "@vonsim/assembler";
import type { JsonObject, Simplify } from "type-fest";

import { CPU } from "./cpu";
import { Handshake, PIOPrinter, PIOSwitchesAndLeds } from "./io/configurations";
import { Memory } from "./memory";

export type ComputerOptions<TDevices extends DevicesConfiguration = DevicesConfiguration> = {
  program: Program;
  devices: TDevices;
} & ({ data: "clean" | "randomize" } | { data: "unchanged"; previous: Computer });

export type DevicesMap = {
  "pio-switches-and-leds": PIOSwitchesAndLeds;
  "pio-printer": PIOPrinter;
  handshake: Handshake;
};

export type DevicesConfiguration = Simplify<keyof DevicesMap>;
export type Devicess = DevicesMap[DevicesConfiguration];

export class Computer<TDevices extends DevicesConfiguration = DevicesConfiguration> {
  readonly cpu: CPU;
  readonly memory: Memory;
  readonly io: DevicesMap[TDevices];

  constructor(options: ComputerOptions<TDevices>) {
    const init = { computer: this, ...options } as const;
    this.cpu = new CPU(init);
    this.memory = new Memory(init);
    if (options.devices === "pio-switches-and-leds") this.io = new PIOSwitchesAndLeds(init);
    else if (options.devices === "pio-printer") this.io = new PIOPrinter(init);
    else if (options.devices === "handshake") this.io = new Handshake(init);
    else throw new Error("Invalid devices configuration");
  }

  toJSON() {
    return {
      cpu: this.cpu.toJSON(),
      memory: this.memory.toJSON(),
      io: this.io.toJSON(),
    } satisfies JsonObject;
  }
}
