import type { Program } from "@vonsim/assembler";
import type { JsonObject } from "type-fest";

import { CPU } from "./cpu";
import { IOInterface } from "./io";
import { Memory } from "./memory";

export type ComputerOptions = {
  program: Program;
  devices: DevicesConfiguration;
} & ({ data: "clean" | "randomize" } | { data: "unchanged"; previous: Computer });

export type DevicesConfiguration = {
  keyboardAndScreen: boolean;
  pic: boolean; // includes clock, f10 and timer
  pio: null | "switches-and-leds" | "printer";
  handshake: null | "printer";
};

/**
 * The computer is the main class of the simulator.
 * It behaves like a real computer, with a CPU, memory and I/O.
 *
 * It can be initialized with a program and one of multiple devices configurations,
 * represented as a IOInterface. Those cannot be changed after initialization. Those are:
 * - `no-devices`: {@link NoDevices}
 * - `keyboard-screen`: {@link KeyboardAndScreen}
 * - `pio-switches-and-leds`: {@link PIOSwitchesAndLeds}
 * - `pio-printer`: {@link PIOPrinter}
 * - `handshake`: {@link Handshake}
 *
 * All the devices are exposed as properties of the computer so other devices can interact with them.
 *
 * ---
 * This class is: MUTABLE
 */
export class Computer {
  readonly cpu: CPU;
  readonly memory: Memory;
  readonly io: IOInterface;

  constructor(options: ComputerOptions) {
    const init = { computer: this, ...options } as const;
    this.cpu = new CPU(init);
    this.memory = new Memory(init);
    this.io = new IOInterface(init);
  }

  toJSON() {
    return {
      cpu: this.cpu.toJSON(),
      memory: this.memory.toJSON(),
      io: this.io.toJSON(),
    } satisfies JsonObject;
  }
}
