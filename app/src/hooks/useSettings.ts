import { useAtomValue } from "jotai";

import {
  dataOnLoadAtom,
  dataRepresentationAtom,
  devicesAtom,
  languageAtom,
  speedsAtom,
} from "@/lib/settings";

export const useLanguage = () => useAtomValue(languageAtom);
export const useDataOnLoad = () => useAtomValue(dataOnLoadAtom);
export const useDevices = () => useAtomValue(devicesAtom);
export const useDataRepresentation = () => useAtomValue(dataRepresentationAtom);
export const useSpeeds = () => useAtomValue(speedsAtom);
