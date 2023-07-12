import { useAtomValue } from "@/lib/jotai";
import { dataOnLoadAtom, dataRepresentationAtom, devicesAtom, languageAtom } from "@/lib/settings";

export const useLanguage = () => useAtomValue(languageAtom);
export const useDataOnLoad = () => useAtomValue(dataOnLoadAtom);
export const useDevices = () => useAtomValue(devicesAtom);
export const useDataRepresentation = () => useAtomValue(dataRepresentationAtom);
