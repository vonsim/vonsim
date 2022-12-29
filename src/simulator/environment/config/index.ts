import create from "zustand";
import { persist } from "zustand/middleware";

export type MemoryRepresentation = "hex" | "bin" | "int" | "uint" | "ascii";
export type MemoryOnReset = "empty" | "random" | "keep";

export type ConfigStore = {
  memoryRepresentation: MemoryRepresentation;
  memoryOnReset: MemoryOnReset;
  clockSpeed: number;
  setMemoryRepresentation: (representation: MemoryRepresentation) => void;
  setMemoryOnReset: (mode: MemoryOnReset) => void;
  setClockSpeed: (speed: number) => void;
};

export const useConfig = create<ConfigStore>()(
  persist(
    set => ({
      memoryRepresentation: "hex",
      memoryOnReset: "random",
      clockSpeed: 1,
      setMemoryRepresentation: representation => set({ memoryRepresentation: representation }),
      setMemoryOnReset: mode => set({ memoryOnReset: mode }),
      setClockSpeed: speed => set({ clockSpeed: speed }),
    }),
    {
      name: "userconfig",
      version: 0,
      getStorage: () => localStorage,
    },
  ),
);
