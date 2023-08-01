import type { Language } from "@vonsim/common/i18n";
import type { ComputerOptions } from "@vonsim/simulator";
import { atomWithStorage } from "jotai/utils";

import { store } from "@/lib/jotai";

/**
 * @returns The preferred language based on the browser's language.
 */
function getDefaultLanguage(): Language {
  const langs: Language[] = ["en", "es"];
  const lang = navigator.language.toLowerCase();
  for (const l of langs) {
    if (lang.startsWith(l)) return l;
  }
  return "en";
}

/**
 * Stores the selected language.
 */
export const languageAtom = atomWithStorage<Language>("language", getDefaultLanguage());
export const getLanguage = () => store.get(languageAtom);

/**
 * Stores the value of {@link ComputerOptions.data}.
 */
export const dataOnLoadAtom = atomWithStorage<ComputerOptions["data"]>("data-on-load", "randomize");
export const getDataOnLoad = () => store.get(dataOnLoadAtom);

/**
 * Stores the value of {@link ComputerOptions.devices}.
 */
export const devicesAtom = atomWithStorage<ComputerOptions["devices"]>(
  "devices",
  "pio-switches-and-leds",
);
export const getDevices = () => store.get(devicesAtom);

export type DataRepresentation = "hex" | "bin" | "int" | "uint" | "ascii";
/**
 * Stores how should the data be represented (binary, hexadecimal, etc.).
 */
export const dataRepresentationAtom = atomWithStorage<DataRepresentation>(
  "data-representation",
  "bin",
);
export const getDataRepresentation = () => store.get(dataRepresentationAtom);

export type Speeds = {
  /**
   * CPU speeds are loosely based on "execution units".
   * Let's say, for example, that updating a register takes 1 execution unit
   * and adding two registers takes 3 execution units.
   *
   * This property stores how many milliseconds one execution unit takes.
   */
  executionUnit: number;

  /**
   * This property stores how many execution units (see above) takes for
   * the printer to print a character. Should be a positive integer.
   * Usually is a large number.
   */
  printer: number;
};

export const speedsAtom = atomWithStorage<Speeds>("speeds", {
  executionUnit: 150,
  printer: 1000,
});
export const getSpeeds = () => store.get(speedsAtom);
