/**
 * VonSim Simulator
 *
 * This module contains the simulator class, which is the main class of VonSim.
 *
 * It's meant to be used as a singleton, and it's the only class that should be
 * used by the UI. Most of the class objects will be created by the Simulator once,
 * with the exeption of the Devices, which can be switched by the UI. They are
 * split into their own modules for convenience.
 *
 * Also, beacuse of the previous point, there will be a lot of references to other
 * objects being passed around. Be careful when using them! although they should
 * be safe, they are not meant to be used outside of the simulator.
 *
 * It has a CPU, a Memory and a set of IO devices. More information about each
 * of them can be found in their respective modules.
 *
 * --------------------
 * About `reset()`
 *
 * The simulator has a `reset()` method, which is meant to be used when the user
 * wants to reset the simulator. It will reset the CPU, the Memory and the IO
 * devices. It will also reset the current time to 0.
 *
 * This method will go deeper into the simulator, and each object will have its
 * own `reset()` method.
 *
 * --------------------
 * About `currentTime`, `nextTick` and `tick()`
 *
 * Across the simulator, there will be a lot of references to the "current time".
 * This is the time that the simulator is currently at. Although there are references
 * to the time being measured in milliseconds, it's not actually measured in any particular
 * unit. It's just a number that increases every time the simulator ticks.
 *
 * The clocks compares the current time with the last time they were ticked to determine
 * how many ticks need to be executed. Also, all references "speed" are in Hertz.
 *
 * The simulator is meant to be used in a "tick-based" way. The UI should call the
 * `run` method with the time that has passed since the last time it was called.
 * This is mearly for convenience, so the UI doesn't need to store the current time.
 *
 * --------------------
 * About `toJSON()`
 *
 * The simulator has a `toJSON()` method, which is meant to be used when the user
 * wants to save the current state of the simulator. It's primary used by React
 * to compare states and handle re-renders.
 */

import { Ok } from "rust-optionals";
import type { Except } from "type-fest";

import type { Program } from "@/compiler";

import type { Jsonable, MemoryMode, SimulatorResult } from "./common";
import { CPU, CPUOptions, InstructionReturn } from "./cpu";
import { DevicesId, DevicesOptions, IOInterface } from "./io";
import { Memory, MemoryOptions } from "./memory";

export type { DevicesId, MemoryMode, SimulatorResult };
export { SimulatorError } from "./common/error";

export interface SimulatorOptions {
  program: Program;
  cpu: Except<CPUOptions, "mode" | "program">;
  memory: Except<MemoryOptions, "program">;
  devices: Except<DevicesOptions, "mode">;
}

export class Simulator implements Jsonable {
  #currentTime = 0;

  #memory = new Memory();
  #io = new IOInterface();
  #cpu = new CPU(this.#memory, this.#io);

  get cpu() {
    return this.#cpu;
  }

  get memory() {
    return this.#memory;
  }

  get devices() {
    return this.#io.devices;
  }

  get currentTime() {
    return this.#currentTime;
  }

  loadProgram(options: SimulatorOptions) {
    this.#currentTime = 0;

    this.#cpu.reset({ ...options.cpu, program: options.program, mode: options.memory.mode });
    this.#memory.reset({ ...options.memory, program: options.program });

    this.#io.reset({ ...options.devices, mode: options.memory.mode });
  }

  switchDevices(id: DevicesId) {
    this.#io.switchDevices(id);
  }

  /**
   * Runs the simulator.
   * @param time Time to advance the simulator, in ms
   */
  run(time: number): InstructionReturn {
    this.#currentTime += time;
    let nextTick = Math.min(this.cpu.nextTick, this.#io.nextTick);

    while (this.#currentTime >= nextTick) {
      const cpuReturn = this.cpu.tick(nextTick);

      if (cpuReturn.isErr()) return cpuReturn;
      if (cpuReturn.unwrap() !== "continue") {
        // If the CPU returned, we need to set the current time to when it stopped
        this.#currentTime = nextTick;
        return cpuReturn;
      }

      this.#io.tick(nextTick);

      nextTick = Math.min(this.cpu.nextTick, this.#io.nextTick);
    }
    return Ok("continue");
  }

  toJSON() {
    return {
      cpu: this.#cpu.toJSON(),
      memory: this.#memory.toJSON(),
      devices: this.#io.toJSON(),
    };
  }
}
