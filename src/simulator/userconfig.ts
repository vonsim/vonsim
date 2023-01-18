import { Language, LANGUAGES } from "@/config";
import type { SimulatorSlice } from "@/simulator";

export type MemoryRepresentation = "hex" | "bin" | "int" | "uint" | "ascii";
export type MemoryOnReset = "empty" | "random" | "keep";
export type DevicesConfiguration = "switches-leds" | "printer-pio" | "printer-handshake";

export type UserConfigSlice = {
  memoryRepresentation: MemoryRepresentation;
  memoryOnReset: MemoryOnReset;
  cpuSpeed: string;
  printerSpeed: string;
  language: Language;
  devicesConfiguration: DevicesConfiguration;
  setMemoryRepresentation: (representation: MemoryRepresentation) => void;
  setMemoryOnReset: (mode: MemoryOnReset) => void;
  setCPUSpeed: (speed: string) => void;
  setPrinterSpeed: (speed: string) => void;
  setLanguage: (lang: Language) => void;
  setDevicesConfiguration: (config: DevicesConfiguration) => void;
};

export const createUserConfigSlice: SimulatorSlice<UserConfigSlice> = set => ({
  memoryRepresentation: "hex",
  memoryOnReset: "random",
  cpuSpeed: "1",
  printerSpeed: "0.125",
  language: getUserLanguage(),
  devicesConfiguration: "switches-leds",
  setMemoryRepresentation: representation => set({ memoryRepresentation: representation }),
  setMemoryOnReset: mode => set({ memoryOnReset: mode }),
  setCPUSpeed: speed => set({ cpuSpeed: speed }),
  setPrinterSpeed: speed => set({ printerSpeed: speed }),
  setLanguage: lang => set({ language: lang }),
  setDevicesConfiguration: config => set({ devicesConfiguration: config }),
});

function getUserLanguage(): Language {
  const lang = navigator.language.toLowerCase();
  for (const l of LANGUAGES) {
    if (lang.startsWith(l)) return l;
  }
  return "en";
}
