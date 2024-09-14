import { Byte } from "@vonsim/common/byte";
import type { ComputerState } from "@vonsim/simulator";
import { atom } from "jotai";

import { store } from "@/lib/jotai";

export const ledsAtom = atom(Byte.zero(8));

export function resetLedsState(computer: ComputerState) {
  if (computer.io.leds === null) return;

  store.set(ledsAtom, Byte.fromUnsigned(computer.io.leds, 8));
}
