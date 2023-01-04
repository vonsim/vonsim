/**
 * Here we define the state of the computer.
 *
 * We use the zustand library to manage the state. It's a very simple yet powerful library.
 * We follow the "slices pattern" to keep the state organized.
 *
 * @see https://github.com/pmndrs/zustand/blob/main/docs/guides/slices-pattern.md
 */

import create, { StateCreator } from "zustand";
import { persist } from "zustand/middleware";

import { ALUSlice, createALUSlice } from "./alu";
import { createExternalSlice, ExternalSlice } from "./external";
import { createMemorySlice, MemorySlice } from "./memory";
import { createProgramSlice, ProgramSlice } from "./program";
import { createRegistersSlice, RegistersSlice } from "./registers";
import { createRunnerSlice, RunnerSlice } from "./runner";
import { createUserConfigSlice, UserConfigSlice } from "./userconfig";

export type ComputerStore = ALUSlice &
  ExternalSlice &
  MemorySlice &
  ProgramSlice &
  RegistersSlice &
  RunnerSlice &
  UserConfigSlice;

export type ComputerSlice<T> = StateCreator<ComputerStore, [["zustand/persist", unknown]], [], T>;

export const useComputer = create<ComputerStore>()(
  persist(
    (...a) => ({
      ...createALUSlice(...a),
      ...createExternalSlice(...a),
      ...createMemorySlice(...a),
      ...createProgramSlice(...a),
      ...createRegistersSlice(...a),
      ...createRunnerSlice(...a),
      ...createUserConfigSlice(...a),
    }),
    {
      name: "userconfig",
      version: 0,
      partialize: state => ({
        memoryRepresentation: state.memoryRepresentation,
        memoryOnReset: state.memoryOnReset,
        clockSpeed: state.clockSpeed,
      }),
    },
  ),
);
