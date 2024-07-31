import type { ComputerState } from "@vonsim/simulator";
import { atom } from "jotai";

import { store } from "@/lib/jotai";

export const screenAtom = atom("");

export function resetScreenState(computer: ComputerState) {
  if (!computer.io.screen) return;

  store.set(screenAtom, computer.io.screen);
}
