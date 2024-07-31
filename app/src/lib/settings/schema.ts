import type { Language } from "@vonsim/common/i18n";
import { z } from "zod";

import { DATA_ON_LOAD_VALUES, LANGUAGES } from "./consts";

export const settingsSchema = z.object({
  /**
   * Interface language.
   */
  language: z.enum(LANGUAGES).catch(getDefaultLanguage),

  /**
   * Font size of the editor. Default is 14.
   */
  editorFontSize: z.number().int().min(8).max(64).catch(14),

  /**
   * Value of {@link ComputerOptions.data}.
   */
  dataOnLoad: z.enum(DATA_ON_LOAD_VALUES).catch("randomize"),

  /**
   * Value of {@link ComputerOptions.devices}.
   */
  devices: z
    .object({
      keyboardAndScreen: z.boolean(),
      pic: z.boolean(),
      pio: z.enum(["switches-and-leds", "printer"]).nullable(),
      handshake: z.enum(["printer"]).nullable(),
    })
    .catch({ keyboardAndScreen: false, pic: false, pio: null, handshake: null }),

  /**
   * Disable animations for faster running. Only affects animations affected
   * by the `executionUnit` (e.g. the cpu). Other animations (like the clock
   * tick and the printer "printing bar") will run normally.
   */
  animations: z.boolean().catch(true),

  /**
   * CPU speeds are loosely based on "execution units".
   * Let's say, for example, that updating a register takes 1 execution unit
   * and adding two registers takes 3 execution units.
   *
   * This property states how many milliseconds one execution unit takes.
   */
  executionUnit: z.number().min(1).max(500).catch(150),

  /**
   * This property states how many milliseconds takes for the clock to tick.
   */
  clockSpeed: z.number().min(100).max(3000).catch(1000),

  /**
   * This property states how many milliseconds units takes for the printer
   * to print a character.
   */
  printerSpeed: z.number().min(500).max(20000).catch(5000),

  /**
   * CSS filter applied to the page.
   */
  filterBightness: z.number().min(0).catch(1),
  filterContrast: z.number().min(0).catch(1),
  filterInvert: z.boolean().catch(false),
  filterSaturation: z.number().min(0).catch(1),
});

export type Settings = z.infer<typeof settingsSchema>;

// Returns an object with default values (`.catch()`)
export const defaultSettings = settingsSchema.parse({});

function getDefaultLanguage(): Language {
  // Return browser default language
  const userLang = navigator.language.toLowerCase();
  for (const lang of LANGUAGES) {
    if (userLang.startsWith(lang)) return lang;
  }
  return "en";
}
