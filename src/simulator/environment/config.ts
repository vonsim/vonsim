import create from "zustand";

export const MEMORY_REPRESENTATIONS = ["hex", "bin", "int", "uint", "ascii"] as const;
export type MemoryRepresentation = typeof MEMORY_REPRESENTATIONS[number];

export type ConfigStore = {
  memoryRepresentation: MemoryRepresentation;
  setMemoryRepresentation: (representation: MemoryRepresentation) => void;
};

export const useConfig = create<ConfigStore>()(set => ({
  memoryRepresentation: "hex",
  setMemoryRepresentation: representation => set({ memoryRepresentation: representation }),
}));
