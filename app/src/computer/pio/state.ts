import { Byte } from "@vonsim/common/byte";
import type { ComputerState } from "@vonsim/simulator";
import { atom } from "jotai";

import { store } from "@/lib/jotai";

export const PAAtom = atom(Byte.zero(8));
export const PBAtom = atom(Byte.zero(8));
export const CAAtom = atom(Byte.zero(8));
export const CBAtom = atom(Byte.zero(8));

export function resetPIOState(computer: ComputerState) {
  if (!computer.io.pio) return;

  store.set(PAAtom, Byte.fromUnsigned(computer.io.pio.PA, 8));
  store.set(PBAtom, Byte.fromUnsigned(computer.io.pio.PB, 8));
  store.set(CAAtom, Byte.fromUnsigned(computer.io.pio.CA, 8));
  store.set(CBAtom, Byte.fromUnsigned(computer.io.pio.CB, 8));
}
