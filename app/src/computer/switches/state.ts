import { Byte } from "@vonsim/common/byte";
import type { ComputerState } from "@vonsim/simulator";
import { atom } from "jotai";

import { store } from "@/lib/jotai";

export const switchesAtom = atom(Byte.zero(8));

export function resetSwitchesState(computer: ComputerState) {
  if (!computer.io.switches) return;

  store.set(switchesAtom, Byte.fromUnsigned(computer.io.switches, 8));
}
