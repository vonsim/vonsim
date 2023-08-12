import type { ComputerState } from "@vonsim/simulator";
import { atom } from "jotai";

import { store } from "@/lib/jotai";

export const consoleAtom = atom("");

export function resetConsoleState(computer: ComputerState) {
  store.set(consoleAtom, computer.io.console);
}
