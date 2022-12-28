import create from "zustand";

export type MemoryRepresentation = "hex" | "bin" | "int" | "uint" | "ascii";
export type MemoryOnReset = "empty" | "random" | "keep";

export type ConfigStore = {
  memoryRepresentation: MemoryRepresentation;
  memoryOnReset: MemoryOnReset;
  setMemoryRepresentation: (representation: MemoryRepresentation) => void;
  setMemoryOnReset: (mode: MemoryOnReset) => void;
};

export const useConfig = create<ConfigStore>()(set => ({
  memoryRepresentation: "hex",
  memoryOnReset: "random",
  setMemoryRepresentation: representation => set({ memoryRepresentation: representation }),
  setMemoryOnReset: mode => set({ memoryOnReset: mode }),
}));
