import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Language, LANGUAGES } from "@/config";
import type { MemoryRepresentation } from "@/helpers";
import type { DevicesId, MemoryMode } from "@/simulator";

export type SettingsStore = {
  language: Language;
  setLanguage: (lang: Language) => void;

  memoryRepresentation: MemoryRepresentation;
  setMemoryRepresentation: (representation: MemoryRepresentation) => void;

  memoryMode: MemoryMode;
  setMemoryMode: (mode: MemoryMode) => void;

  devices: DevicesId;
  setDevices: (id: DevicesId) => void;

  speeds: { cpu: number; printer: number };
  setSpeed: (device: "cpu" | "printer", speed: number) => void;
};

export const useSettings = create<SettingsStore>()(
  persist(
    set => ({
      language: getDefaultLanguage(),
      setLanguage: lang => set({ language: lang }),

      memoryRepresentation: "bin",
      setMemoryRepresentation: representation => set({ memoryRepresentation: representation }),

      memoryMode: "randomize",
      setMemoryMode: mode => set({ memoryMode: mode }),

      devices: "switches-and-leds",
      setDevices: id => set({ devices: id }),

      speeds: { cpu: 1, printer: 0.125 },
      setSpeed: (device, speed) => set(state => ({ speeds: { ...state.speeds, [device]: speed } })),
    }),
    { name: "settings", version: 1 },
  ),
);

function getDefaultLanguage(): Language {
  const lang = navigator.language.toLowerCase();
  for (const l of LANGUAGES) {
    if (lang.startsWith(l)) return l;
  }
  return "en";
}
