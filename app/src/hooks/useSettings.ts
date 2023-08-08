import { atom, useAtom, useAtomValue } from "jotai";

import { settingsAtom } from "@/lib/settings";

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
