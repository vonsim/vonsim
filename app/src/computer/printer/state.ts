import { Byte } from "@vonsim/common/byte";
import type { ComputerState } from "@vonsim/simulator";
import { atom } from "jotai";

import { store } from "@/lib/jotai";

export const bufferAtom = atom<Byte<8>[]>([]);
export const paperAtom = atom("");

export function resetPrinterState(computer: ComputerState) {
  if (!("printer" in computer.io)) return;

  store.set(
    bufferAtom,
    computer.io.printer.buffer.map(char => Byte.fromUnsigned(char, 8)),
  );
  store.set(paperAtom, computer.io.printer.paper);
}
