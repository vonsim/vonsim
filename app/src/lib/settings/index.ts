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
  { getOnInit: true },
);

export const getSettings = () => store.get(settingsAtom);

export const useSettings = () => useAtom(settingsAtom);

const languageAtom = atom(get => get(settingsAtom).language);
export const useLanguage = () => useAtomValue(languageAtom);

const themeAtom = atom(get => get(settingsAtom).theme);
export const useTheme = () => useAtomValue(themeAtom);

const editorFontSizeAtom = atom(get => get(settingsAtom).editorFontSize);
export const useEditorFontSize = () => useAtomValue(editorFontSizeAtom);

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
