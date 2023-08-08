import { LANGUAGES } from "@vonsim/common/i18n";
import { atomWithStorage } from "jotai/utils";
import { z } from "zod";

import { store } from "@/lib/jotai";

export { LANGUAGES };
export const DATA_ON_LOAD_VALUES = ["randomize", "clean", "unchanged"] as const;
export const DEVICES = ["pio-switches-and-leds", "pio-printer", "handshake"] as const;

const settingsSchema = z.object({
  /**
   * Interface language.
   */
  language: z.enum(LANGUAGES).catch(() => {
    // Return browser default language
    const userLang = navigator.language.toLowerCase();
    for (const lang of LANGUAGES) {
      if (userLang.startsWith(lang)) return lang;
    }
    return "en";
  }),

  /**
   * Value of {@link ComputerOptions.data}.
   */
  dataOnLoad: z.enum(DATA_ON_LOAD_VALUES).catch("randomize"),

  /**
   * Value of {@link ComputerOptions.devices}.
   */
  devices: z.enum(DEVICES).catch("pio-switches-and-leds"),

  /**
   * CPU speeds are loosely based on "execution units".
   * Let's say, for example, that updating a register takes 1 execution unit
   * and adding two registers takes 3 execution units.
   *
   * This property states how many milliseconds one execution unit takes.
   */
  executionUnit: z.number().int().min(5).max(500).catch(150),

  /**
   * This property states how many execution units (see above) takes for
   * the clock to tick. Should be a positive integer.
   * Usually is a large number.
   */
  clockSpeed: z.number().int().min(10).max(1000).catch(30),

  /**
   * This property states how many execution units (see above) takes for
   * the printer to print a character. Should be a positive integer.
   * Usually is a large number.
   */
  printerSpeed: z.number().int().min(10).max(1000).catch(1000),
});

export type Settings = z.infer<typeof settingsSchema>;

const defaultSettings = settingsSchema.parse({}); // Returns an object with default values (`.catch()`)

export const settingsAtom = atomWithStorage<Settings>(
  "vonsim-settings",
  defaultSettings,
  {
    getItem(key, initialValue) {
      try {
        const storedValue = localStorage.getItem(key);
        return settingsSchema.parse(JSON.parse(storedValue ?? ""));
      } catch {
        return initialValue;
      }
    },
    setItem(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    },
    removeItem(key) {
      localStorage.removeItem(key);
    },
    subscribe(key, callback, initialValue) {
      const listener = (e: StorageEvent) => {
        if (e.storageArea === localStorage && e.key === key) {
          let newValue;
          try {
            newValue = settingsSchema.parse(JSON.parse(e.newValue ?? ""));
          } catch {
            newValue = initialValue;
          }
          callback(newValue);
        }
      };

      window?.addEventListener("storage", listener);
      return () => window?.removeEventListener("storage", listener);
    },
  },
  { unstable_getOnInit: true },
);

export const getSettings = () => store.get(settingsAtom);
