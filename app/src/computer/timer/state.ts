import { Byte } from "@vonsim/common/byte";
import type { ComputerState } from "@vonsim/simulator";
import { atom } from "jotai";

import { store } from "@/lib/jotai";

export const CONTAtom = atom(Byte.zero(8));
export const COMPAtom = atom(Byte.zero(8));

export function resetTimerState(computer: ComputerState) {
  if (!("timer" in computer.io)) return;

  store.set(CONTAtom, Byte.fromUnsigned(computer.io.timer.CONT, 8));
  store.set(COMPAtom, Byte.fromUnsigned(computer.io.timer.COMP, 8));
}
