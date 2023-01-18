/**
 * Here we define the state of the simulator.
 *
 * We use the zustand library to manage the state. It's a very simple yet powerful library.
 * We follow the "slices pattern" to keep the state organized.
 *
 * @see https://github.com/pmndrs/zustand/blob/main/docs/guides/slices-pattern.md
 */

import { create, StateCreator } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

import { ALUSlice, createALUSlice } from "./alu";
import { createDevicesSlice, DevicesSlice } from "./devices";
import { createInterruptsSlice, InterruptsSlice } from "./interrupts";
import { createMemorySlice, MemorySlice } from "./memory";
import { createProgramSlice, ProgramSlice } from "./program";
import { createRegistersSlice, RegistersSlice } from "./registers";
import { createRunnerSlice, RunnerSlice } from "./runner";
import { createUserConfigSlice, UserConfigSlice } from "./userconfig";

export type SimulatorStore = ALUSlice &
  DevicesSlice &
  InterruptsSlice &
  MemorySlice &
  ProgramSlice &
  RegistersSlice &
  RunnerSlice &
  UserConfigSlice;

export type SimulatorSlice<T> = StateCreator<
  SimulatorStore,
  [["zustand/persist", unknown], ["zustand/immer", unknown]],
  [],
  T
>;

export const useSimulator = create<SimulatorStore>()(
  persist(
    immer((...a) => ({
      ...createALUSlice(...a),
      ...createDevicesSlice(...a),
      ...createInterruptsSlice(...a),
      ...createMemorySlice(...a),
      ...createProgramSlice(...a),
      ...createRegistersSlice(...a),
      ...createRunnerSlice(...a),
      ...createUserConfigSlice(...a),
    })),
    {
      name: "userconfig",
      version: 0,
      partialize: state => ({
        memoryRepresentation: state.memoryRepresentation,
        memoryOnReset: state.memoryOnReset,
        cpuSpeed: state.cpuSpeed,
        printerSpeed: state.printerSpeed,
        language: state.language,
        devicesConfiguration: state.devicesConfiguration,
      }),
    },
  ),
);

if (import.meta.env.DEV) {
  import("just-diff").then(({ diff: getDiff }) => {
    useSimulator.subscribe((current, prev) => {
      const diff = getDiff(prev, current);

      if (diff.length === 0) {
        console.debug("[simulator]", "no changes");
        return;
      }

      console.debug(
        diff
          .map(({ op, path, value }) => {
            let msg = "[simulator] " + path.join(".");

            if (op === "remove") {
              msg += " (removed)";
            } else {
              msg += ` = ${value}`;
            }

            return msg;
          })
          .join("\n"),
      );
    });
  });
}
