import { Byte } from "@vonsim/common/byte";
import type { ComputerState } from "@vonsim/simulator";
import { atom } from "jotai";

import { store } from "@/lib/jotai";

export const DATAAtom = atom(Byte.zero(8));
export const STATEAtom = atom(Byte.zero(8));

export function resetHandshakeState(computer: ComputerState) {
  if (!computer.io.handshake) return;

  store.set(DATAAtom, Byte.fromUnsigned(computer.io.handshake.DATA, 8));
  store.set(STATEAtom, Byte.fromUnsigned(computer.io.handshake.STATE, 8));
}
