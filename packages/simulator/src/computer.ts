import type { Program } from "@vonsim/assembler";
import type { JsonObject, Simplify } from "type-fest";

import { CPU } from "./cpu";
import {
  Handshake,
  KeyboardAndScreen,
  NoDevices,
  PIOPrinter,
  PIOSwitchesAndLeds,
} from "./io/configurations";
import { Memory } from "./memory";

export type ComputerOptions<TDevices extends DevicesConfiguration = DevicesConfiguration> = {
  program: Program;
  devices: TDevices;
} & ({ data: "clean" | "randomize" } | { data: "unchanged"; previous: Computer });

export type DevicesMap = {
  "no-devices": NoDevices;
  "keyboard-and-screen": KeyboardAndScreen;
  "pio-switches-and-leds": PIOSwitchesAndLeds;
  "pio-printer": PIOPrinter;
  handshake: Handshake;
};

export type DevicesConfiguration = Simplify<keyof DevicesMap>;

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
export class Computer<TDevices extends DevicesConfiguration = DevicesConfiguration> {
  readonly cpu: CPU;
  readonly memory: Memory;
  readonly io: DevicesMap[TDevices];

  constructor(options: ComputerOptions<TDevices>) {
    const init = { computer: this, ...options } as const;
    this.cpu = new CPU(init);
    this.memory = new Memory(init);

    switch (options.devices) {
      case "no-devices": {
        // @ts-expect-error ensured by `TDevices` and `options`
        this.io = new NoDevices(init);
        break;
      }

      case "keyboard-and-screen": {
        // @ts-expect-error ensured by `TDevices` and `options`
        this.io = new KeyboardAndScreen(init);
        break;
      }

      case "pio-switches-and-leds": {
        // @ts-expect-error ensured by `TDevices` and `options`
        this.io = new PIOSwitchesAndLeds(init);
        break;
      }

      case "pio-printer": {
        // @ts-expect-error ensured by `TDevices` and `options`
        this.io = new PIOPrinter(init);
        break;
      }

      case "handshake": {
        // @ts-expect-error ensured by `TDevices` and `options`
        this.io = new Handshake(init);
        break;
      }

      default: {
        const _exhaustiveCheck: never = options.devices;
        throw new Error(`Unknown devices configuration: ${_exhaustiveCheck}`);
      }
    }
  }

  toJSON() {
    return {
      cpu: this.cpu.toJSON(),
      memory: this.memory.toJSON(),
      // This is safe because `TDevices` is ensured to be a key of `DevicesMap`
      // Nonetheless, this worked without the assertion with TypeScript v5.2.2,
      // but stopped working with v5.3.3. I don't know why.
      io: this.io.toJSON() as ReturnType<DevicesMap[DevicesConfiguration]["toJSON"]>,
    } satisfies JsonObject;
  }
}
