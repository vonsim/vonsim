import { MemoryAddress } from "@vonsim/common/address";
import { Byte } from "@vonsim/common/byte";
import { atom } from "jotai";

export const memoryAtom = atom(
  new Array<Byte<8>>(MemoryAddress.MAX_ADDRESS + 1).fill(Byte.zero(8)),
);

export const selectedAddressAtom = atom<MemoryAddress>(MemoryAddress.from(0x1000));

type MemoryShown = { address: MemoryAddress; value: Byte<8> }[];
const ROWS = 8;

export const memoryShownAtom = atom<MemoryShown>(get => {
  const selected = get(selectedAddressAtom);
  const lowEnd = selected.value - (selected.value % ROWS);
  const memory = get(memoryAtom);
  const result: MemoryShown = [];
  for (let i = 0; i < ROWS; i++) {
    result.push({
      address: MemoryAddress.from(lowEnd + i),
      value: memory[lowEnd + i],
    });
  }
  return result;
});
