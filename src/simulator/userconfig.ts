import { Language, LANGUAGES } from "@/config";
import type { SimulatorSlice } from "@/simulator";

export type MemoryRepresentation = "hex" | "bin" | "int" | "uint" | "ascii";
export type MemoryOnReset = "empty" | "random" | "keep";

export type UserConfigSlice = {
  memoryRepresentation: MemoryRepresentation;
  memoryOnReset: MemoryOnReset;
  clockSpeed: number;
  language: Language;
  setMemoryRepresentation: (representation: MemoryRepresentation) => void;
  setMemoryOnReset: (mode: MemoryOnReset) => void;
  setClockSpeed: (speed: number) => void;
  setLanguage: (lang: Language) => void;
};

export const createUserConfigSlice: SimulatorSlice<UserConfigSlice> = set => ({
  memoryRepresentation: "hex",
  memoryOnReset: "random",
  clockSpeed: 1,
  language: getUserLanguage(),
  setMemoryRepresentation: representation => set({ memoryRepresentation: representation }),
  setMemoryOnReset: mode => set({ memoryOnReset: mode }),
  setClockSpeed: speed => set({ clockSpeed: speed }),
  setLanguage: lang => set({ language: lang }),
});

function getUserLanguage(): Language {
  const lang = navigator.language.toLowerCase();
  for (const l of LANGUAGES) {
    if (lang.startsWith(l)) return l;
  }
  return "en";
}
