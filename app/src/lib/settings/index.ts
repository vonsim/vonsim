import { atom, useAtom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { store } from "@/lib/jotai";

import { defaultSettings, Settings, settingsSchema } from "./schema";

export * from "./consts";

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

export const useSettings = () => useAtom(settingsAtom);

const languageAtom = atom(get => get(settingsAtom).language);
export const useLanguage = () => useAtomValue(languageAtom);

const dataOnLoadAtom = atom(get => get(settingsAtom).dataOnLoad);
export const useDataOnLoad = () => useAtomValue(dataOnLoadAtom);

const devicesAtom = atom(get => get(settingsAtom).devices);
export const useDevices = () => useAtomValue(devicesAtom);

const speedsAtom = atom(get => {
  const settings = get(settingsAtom);
  return {
    executionUnit: settings.executionUnit,
    clock: settings.clockSpeed,
    printer: settings.printerSpeed,
  };
});
export const useSpeeds = () => useAtomValue(speedsAtom);

const filtersAtom = atom(get => {
  const settings = get(settingsAtom);

  return [
    `brightness(${settings.filterBightness})`,
    `contrast(${settings.filterContrast})`,
    `invert(${settings.filterInvert ? 1 : 0})`,
    `saturate(${settings.filterSaturation})`,
  ]
    .filter(Boolean)
    .join(" ");
});
export const useFilters = () => useAtomValue(filtersAtom);
