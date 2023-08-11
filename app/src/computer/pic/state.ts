import { Byte } from "@vonsim/common/byte";
import type { ComputerState } from "@vonsim/simulator";
import { atom } from "jotai";

import type { ByteAtom } from "@/computer/shared/types";
import { store } from "@/lib/jotai";

export const IMRAtom = atom(Byte.fromUnsigned(0xff, 8));
export const IRRAtom = atom(Byte.fromUnsigned(0x00, 8));
export const ISRAtom = atom(Byte.fromUnsigned(0x00, 8));
export const linesAtoms: ByteAtom<8>[] = [
  atom(Byte.zero(8)), // INT0
  atom(Byte.zero(8)), // INT1
  atom(Byte.zero(8)), // INT2
  atom(Byte.zero(8)), // INT3
  atom(Byte.zero(8)), // INT4
  atom(Byte.zero(8)), // INT5
  atom(Byte.zero(8)), // INT6
  atom(Byte.zero(8)), // INT7
];

export function resetPICState(computer: ComputerState) {
  store.set(IMRAtom, Byte.fromUnsigned(computer.io.pic.IMR, 8));
  store.set(IRRAtom, Byte.fromUnsigned(computer.io.pic.IRR, 8));
  store.set(ISRAtom, Byte.fromUnsigned(computer.io.pic.ISR, 8));
  for (let i = 0; i < linesAtoms.length; i++) {
    store.set(linesAtoms[i], Byte.fromUnsigned(computer.io.pic.lines[i], 8));
  }
}
