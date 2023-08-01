import type { Language } from "@vonsim/common/i18n";
import type { ComputerOptions } from "@vonsim/simulator";
import { atomWithStorage } from "jotai/utils";

import { store } from "@/lib/jotai";

function getDefaultLanguage(): Language {
  const langs: Language[] = ["en", "es"];
  const lang = navigator.language.toLowerCase();
  for (const l of langs) {
    if (lang.startsWith(l)) return l;
  }
  return "en";
}

export const languageAtom = atomWithStorage<Language>("language", getDefaultLanguage());
export const getLanguage = () => store.get(languageAtom);

export const dataOnLoadAtom = atomWithStorage<ComputerOptions["data"]>("data-on-load", "randomize");
export const getDataOnLoad = () => store.get(dataOnLoadAtom);

export const devicesAtom = atomWithStorage<ComputerOptions["devices"]>(
  "devices",
  "pio-switches-and-leds",
);
export const getDevices = () => store.get(devicesAtom);

export type DataRepresentation = "hex" | "bin" | "int" | "uint" | "ascii";
export const dataRepresentationAtom = atomWithStorage<DataRepresentation>(
  "data-representation",
  "bin",
);
export const getDataRepresentation = () => store.get(dataRepresentationAtom);

export const speedsAtom = atomWithStorage<{ cpu: number; printer: number }>("speeds", {
  cpu: 1,
  printer: 0.125,
});
export const getSpeeds = () => store.get(speedsAtom);
