import { MemoryAddress } from "@vonsim/common/address";
import { Byte } from "@vonsim/common/byte";
import type { ComputerState } from "@vonsim/simulator";
import { atom } from "jotai";

import { store } from "@/lib/jotai";

export const memoryAtom = atom(
  new Array<Byte<8>>(MemoryAddress.MAX_ADDRESS + 1).fill(Byte.zero(8)),
);

export const operatingAddressAtom = atom<MemoryAddress>(MemoryAddress.from(0x2000));
export const fixedAddressAtom = atom<MemoryAddress | null>(null);

type MemoryShown = { address: MemoryAddress; value: Byte<8> }[][];
const ROWS = 8;
const COLS = 2;

export const memoryShownAtom = atom<MemoryShown>(get => {
  // If there's a fixed address, show it and the surrounding addresses
  // Otherwise, show the operating address and the surrounding addresses
  const selected = get(fixedAddressAtom) ?? get(operatingAddressAtom);

  let lowEnd = selected.value - (selected.value % (ROWS * COLS));
  let highEnd = lowEnd + ROWS * COLS - 1;
  // Prevent overflow
  if (highEnd > MemoryAddress.MAX_ADDRESS) {
    highEnd = MemoryAddress.MAX_ADDRESS;
    lowEnd = highEnd - ROWS * COLS + 1;
  }

  const memory = get(memoryAtom);
  const result: MemoryShown = [];
  for (let i = 0; i < ROWS; i++) {
    result.push([]);
    for (let j = 0; j < COLS; j++) {
      const addr = lowEnd + i + j * ROWS;
      result.at(-1)!.push({
        address: MemoryAddress.from(addr),
        value: memory[addr],
      });
    }
  }
  return result;
});

export function resetMemoryState(computer: ComputerState) {
  store.set(
    memoryAtom,
    computer.memory.map(byte => Byte.fromUnsigned(byte, 8)),
  );
  store.set(operatingAddressAtom, MemoryAddress.from(0x2000));
}
